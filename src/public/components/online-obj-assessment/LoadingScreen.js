export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Submitting Your Answers</h3>
          <p className="text-gray-600 text-center">Please wait while we process your quiz...</p>
        </div>
      </div>
    </div>
  );
}
