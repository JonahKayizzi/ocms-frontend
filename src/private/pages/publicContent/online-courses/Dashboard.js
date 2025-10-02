import {
  Users, BookOpen, PlayCircle, TrendingUp, Clock, CheckCircle,
} from 'lucide-react';

const DashboardOnlineCourse = () => {
  const stats = [
    {
      name: 'Total Employees', value: '1,234', icon: Users, color: 'bg-blue-500',
    },
    {
      name: 'Active Courses', value: '45', icon: BookOpen, color: 'bg-green-500',
    },
    {
      name: 'Total Lessons', value: '342', icon: PlayCircle, color: 'bg-purple-500',
    },
    {
      name: 'Completion Rate', value: '87%', icon: TrendingUp, color: 'bg-orange-500',
    },
  ];

  const recentActivity = [
    {
      id: 1, action: 'New course "Air Traffic Control Basics" created', time: '2 hours ago', type: 'course',
    },
    {
      id: 2, action: 'Employee John Smith completed "Safety Procedures"', time: '4 hours ago', type: 'completion',
    },
    {
      id: 3, action: 'Quiz "Navigation Principles" updated', time: '6 hours ago', type: 'quiz',
    },
    {
      id: 4, action: 'Module "Weather Systems" added to course', time: '1 day ago', type: 'module',
    },
  ];

  return (
    <div className="p-6 space-y-6 dark:bg-gray-900/50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-300">Online Course Overview</h1>
        <div className="text-sm text-gray-300">
          Last updated:
          {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-private-clr rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">{stat.name}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-private-clr rounded-lg shadow-lg border border-gray-700/50">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-200">Recent Activity</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-400">Live</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="group flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-800/50 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-700/50"
                >
                  <div className="flex-shrink-0 relative">
                    <div className="p-2 rounded-lg bg-gray-800/50 group-hover:bg-gray-700/50 transition-colors duration-200">
                      {activity.type === 'course' && <BookOpen className="h-5 w-5 text-blue-400" />}
                      {activity.type === 'completion' && <CheckCircle className="h-5 w-5 text-green-400" />}
                      {activity.type === 'quiz' && <PlayCircle className="h-5 w-5 text-purple-400" />}
                      {activity.type === 'module' && <Clock className="h-5 w-5 text-orange-400" />}
                    </div>
                    <div className="absolute -top-1 -right-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm text-gray-200 group-hover:text-white transition-colors duration-200 leading-relaxed">
                        {activity.action}
                      </p>

                      {(() => {
                        const typeStyles = {
                          course: {
                            class: 'bg-blue-900/30 text-blue-300 border border-blue-700/50',
                            label: 'Course',
                          },
                          completion: {
                            class: 'bg-green-900/30 text-green-300 border border-green-700/50',
                            label: 'Completion',
                          },
                          quiz: {
                            class: 'bg-purple-900/30 text-purple-300 border border-purple-700/50',
                            label: 'Quiz',
                          },
                          default: {
                            class: 'bg-orange-900/30 text-orange-300 border border-orange-700/50',
                            label: 'Module',
                          },
                        };

                        const { class: badgeClass, label: badgeLabel } = typeStyles[activity.type]
                         || typeStyles.default;

                        return (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClass}`}>
                            {badgeLabel}
                          </span>
                        );
                      })()}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                          {activity.time}
                        </p>
                        <span className="text-gray-600">•</span>
                        <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-200">
                          by Admin User
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button type="button" className="p-1 rounded-full hover:bg-gray-700/50 transition-colors duration-200">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <button type="button" className="w-full text-center text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200 py-2 rounded-lg hover:bg-gray-800/30">
                View All Activity →
              </button>
            </div>
          </div>
        </div>
        {/* Quick Actions */}
        <div className="bg-private-clr rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-gray-200">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="group flex flex-col items-center p-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-400 hover:bg-blue-900/20 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <BookOpen className="h-10 w-10 text-blue-400 mb-3 group-hover:text-blue-300 transition-colors duration-300" />
                <span className="text-sm font-medium text-gray-300 group-hover:text-blue-200 transition-colors duration-300">
                  Create Course
                </span>
              </button>

              <button type="button" className="group flex flex-col items-center p-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-green-400 hover:bg-green-900/20 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <Users className="h-10 w-10 text-green-400 mb-3 group-hover:text-green-300 transition-colors duration-300" />
                <span className="text-sm font-medium text-gray-300 group-hover:text-green-200 transition-colors duration-300">
                  Add Employee
                </span>
              </button>

              <button type="button" className="group flex flex-col items-center p-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-400 hover:bg-purple-900/20 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <PlayCircle className="h-10 w-10 text-purple-400 mb-3 group-hover:text-purple-300 transition-colors duration-300" />
                <span className="text-sm font-medium text-gray-300 group-hover:text-purple-200 transition-colors duration-300">
                  New Lesson
                </span>
              </button>

              <button type="button" className="group flex flex-col items-center p-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-orange-400 hover:bg-orange-900/20 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <TrendingUp className="h-10 w-10 text-orange-400 mb-3 group-hover:text-orange-300 transition-colors duration-300" />
                <span className="text-sm font-medium text-gray-300 group-hover:text-orange-200 transition-colors duration-300">
                  View Reports
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOnlineCourse;
