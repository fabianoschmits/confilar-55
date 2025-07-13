import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import MediaUpload from '@/components/MediaUpload';
import WorkForm from '@/components/WorkForm';
import { useCreateWork } from '@/hooks/useCreateWork';

const CreateWork = () => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    isAnonymous,
    setIsAnonymous,
    price,
    setPrice,
    location,
    setLocation,
    category,
    setCategory,
    mediaFiles,
    submitting,
    handleFileChange,
    removeFile,
    createWork
  } = useCreateWork();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">Postar Trabalho</h1>
            <p className="text-muted-foreground">Compartilhe seu trabalho com fotos e vídeos</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <WorkForm
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              category={category}
              setCategory={setCategory}
              price={price}
              setPrice={setPrice}
              location={location}
              setLocation={setLocation}
              isAnonymous={isAnonymous}
              setIsAnonymous={setIsAnonymous}
              onSubmit={createWork}
              submitting={submitting}
            />
            
            <MediaUpload
              mediaFiles={mediaFiles}
              onFileChange={handleFileChange}
              onRemoveFile={removeFile}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateWork;