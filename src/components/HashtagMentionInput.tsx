import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';

interface HashtagMentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  onHashtagsExtracted?: (hashtags: string[]) => void;
}

interface Suggestion {
  id: string;
  text: string;
  type: 'hashtag' | 'mention';
}

const HashtagMentionInput = ({ 
  value, 
  onChange, 
  placeholder, 
  className,
  rows = 3,
  onHashtagsExtracted 
}: HashtagMentionInputProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Extract hashtags when text changes
    const hashtags = extractHashtags(value);
    onHashtagsExtracted?.(hashtags);
  }, [value, onHashtagsExtracted]);

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex) || [];
    return matches.map(tag => tag.slice(1)); // Remove the # symbol
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(cursorPos);
    
    // Check if we're typing a hashtag or mention
    const words = newValue.split(/\s/);
    const currentWordIndex = newValue.substring(0, cursorPos).split(/\s/).length - 1;
    const word = words[currentWordIndex] || '';
    
    if (word.startsWith('#') && word.length > 1) {
      setCurrentWord(word);
      searchHashtags(word.slice(1));
    } else if (word.startsWith('@') && word.length > 1) {
      setCurrentWord(word);
      searchUsers(word.slice(1));
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const searchHashtags = async (query: string) => {
    try {
      // Search for existing hashtags in posts
      // Since posts table doesn't have hashtags column, let's extract from content
      const { data, error } = await supabase
        .from('posts')
        .select('content')
        .limit(50);

      if (error) throw error;

      const allHashtags = new Set<string>();
      data?.forEach(post => {
        const hashtags = post.content.match(/#(\w+)/g) || [];
        hashtags.forEach(tag => {
          const cleanTag = tag.slice(1); // Remove #
          if (cleanTag.toLowerCase().includes(query.toLowerCase())) {
            allHashtags.add(cleanTag);
          }
        });
      });

      const hashtagSuggestions: Suggestion[] = Array.from(allHashtags)
        .slice(0, 5)
        .map(tag => ({
          id: tag,
          text: `#${tag}`,
          type: 'hashtag'
        }));

      setSuggestions(hashtagSuggestions);
      setShowSuggestions(hashtagSuggestions.length > 0);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Erro ao buscar hashtags:', error);
    }
  };

  const searchUsers = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .ilike('full_name', `%${query}%`)
        .limit(5);

      if (error) throw error;

      const userSuggestions: Suggestion[] = data?.map(user => ({
        id: user.user_id,
        text: `@${user.full_name}`,
        type: 'mention'
      })) || [];

      setSuggestions(userSuggestions);
      setShowSuggestions(userSuggestions.length > 0);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    const words = value.split(/\s/);
    const currentWordIndex = value.substring(0, cursorPosition).split(/\s/).length - 1;
    
    words[currentWordIndex] = suggestion.text;
    const newValue = words.join(' ') + ' ';
    
    onChange(newValue);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev === 0 ? suggestions.length - 1 : prev - 1);
        break;
      case 'Enter':
        if (suggestions[selectedIndex]) {
          e.preventDefault();
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const renderFormattedText = () => {
    if (!value) return null;
    
    return value.split(/(\s+)/).map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span key={index} className="text-primary font-semibold">
            {word}
          </span>
        );
      } else if (word.startsWith('@')) {
        return (
          <span key={index} className="text-accent font-semibold">
            {word}
          </span>
        );
      }
      return word;
    });
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        rows={rows}
      />
      
      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={`px-3 py-2 cursor-pointer hover:bg-accent/50 ${
                index === selectedIndex ? 'bg-accent/50' : ''
              }`}
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <span className={
                suggestion.type === 'hashtag' 
                  ? 'text-primary font-semibold' 
                  : 'text-accent font-semibold'
              }>
                {suggestion.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HashtagMentionInput;