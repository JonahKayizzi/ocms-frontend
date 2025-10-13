import PropTypes from 'prop-types';
import { Play } from 'lucide-react';

export default function VideoSection({
  currentLesson,
  currentLessonNumber,
  totalLessons,
  loomVideoUrl,
  contentHtml,
  onPrev = () => {},
  onNext = () => {},
  onComplete = () => {},
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <Play className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Current Lesson:
            {' '}
            {currentLesson}
          </h2>
        </div>
        <p className="text-gray-600">
          Learn the fundamentals of Hazard Identification and how to build a
          robust reporting system
        </p>
      </div>
      <div className="p-6">
        {loomVideoUrl ? (
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
            <div
              style={{
                position: 'relative',
                paddingBottom: '56.25%',
                height: '0',
              }}
            >
              <iframe
                src={loomVideoUrl}
                frameBorder="0"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
                title="Course Video Lesson"
              />
            </div>
          </div>
        ) : (
          <div className="prose max-w-none">
            {/* eslint-disable react/no-danger */}
            <div dangerouslySetInnerHTML={{ __html: contentHtml || '<p>No video or content provided.</p>' }} />
            {/* eslint-enable react/no-danger */}
          </div>
        )}
        {/* <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">
            📹 How to embed your Loom video:
          </h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Go to your Loom video's share page</li>
            <li>Click "Share" above the video, then click "Embed"</li>
            <li>
              Make sure privacy settings are set to "anyone with the link can
              view"
            </li>
            <li>
              Copy the provided embed code and replace the iframe src above
            </li>
            <li>Choose between Responsive or Fixed Size HTML code as needed</li>
          </ol>
        </div> */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={onPrev}
              disabled={currentLessonNumber <= 1}
              className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium ${currentLessonNumber <= 1 ? 'text-gray-400 cursor-not-allowed bg-gray-50' : 'text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
            >
              Previous Lesson
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={currentLessonNumber >= totalLessons}
              className={`px-4 py-2 text-white text-sm font-medium rounded-md ${currentLessonNumber >= totalLessons ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
            >
              Next Lesson
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Lesson
            {' '}
            {currentLessonNumber}
            {' '}
            of
            {' '}
            {totalLessons}
          </div>
          <button
            type="button"
            onClick={onComplete}
            className="ml-4 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Mark as completed
          </button>
        </div>
      </div>
    </div>
  );
}

VideoSection.propTypes = {
  currentLesson: PropTypes.string.isRequired,
  currentLessonNumber: PropTypes.number.isRequired,
  totalLessons: PropTypes.number.isRequired,
  loomVideoUrl: PropTypes.string,
  contentHtml: PropTypes.string,
  onComplete: PropTypes.func,
};

VideoSection.defaultProps = {
  loomVideoUrl: '',
  contentHtml: '',
  onComplete: () => {},
};
