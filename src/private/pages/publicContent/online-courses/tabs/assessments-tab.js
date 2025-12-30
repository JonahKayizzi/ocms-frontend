import React, { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  Plus,
  Edit,
  Trash2,
  BarChart3,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Users,
  Target,
  BadgeCheck,
  UserCircle,
  CalendarClock,
  Timer,
  Download,
  FileText,
  Table,
  Award,
} from "lucide-react";
import AssessmentForm from "../forms/assessment-form";
import {
  useGetAssessmentsByCourseQuery,
  useGetStandaloneAssessmentsQuery,
  useCreateAssessmentMutation,
  useUpdateAssessmentMutation,
  useDeleteAssessmentMutation,
  useGetQuizAttemptsByAssessmentQuery,
  useLazyGetQuizAttemptByIdQuery,
} from "../../../../../redux/apiSlice";

export default function AssessmentsTab({
  selectedCourse,
  standaloneCategory,
  filterCategory,
}) {
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [resultsAssessment, setResultsAssessment] = useState(null);

  // API data
  const courseId = selectedCourse?.id;
  const {
    data: courseAssessments,
    isLoading: courseAssessmentsLoading,
    isError: courseAssessmentsError,
  } = useGetAssessmentsByCourseQuery(courseId, { skip: !courseId });

  const {
    data: standaloneAssessments,
    isLoading: standaloneAssessmentsLoading,
    isError: standaloneAssessmentsError,
  } = useGetStandaloneAssessmentsQuery(
    standaloneCategory || filterCategory || undefined, 
    { skip: !!courseId }
  );

  const [createAssessment] = useCreateAssessmentMutation();
  const [updateAssessment] = useUpdateAssessmentMutation();
  const [deleteAssessment, { isLoading: deleting }] =
    useDeleteAssessmentMutation();

  const apiAssessments = useMemo(() => {
    if (courseId)
      return Array.isArray(courseAssessments) ? courseAssessments : [];
    // Filter by category if provided
    return Array.isArray(standaloneAssessments) ? standaloneAssessments : [];
  }, [courseId, courseAssessments, standaloneAssessments]);

  const loading = courseId
    ? courseAssessmentsLoading
    : standaloneAssessmentsLoading;
  const error = courseId ? courseAssessmentsError : standaloneAssessmentsError;

  const handleAddAssessment = () => {
    setEditingAssessment(null);
    setShowForm(true);
  };

  const handleEditAssessment = (assessment) => {
    setEditingAssessment(assessment);
    setShowForm(true);
  };

  const handleViewResults = (assessment) => {
    setResultsAssessment(assessment);
  };

  const handleDeleteAssessment = async (id) => {
    await deleteAssessment(id);
  };

  const handleSaveAssessment = async (savedAssessment) => {
    // The AssessmentForm already handles the API call and returns the saved assessment
    // We just need to close the form - the cache will be invalidated automatically
    setShowForm(false);
    setEditingAssessment(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  const cardClass = "bg-white rounded-lg shadow p-6";
  const cardHeaderClass = "flex flex-row items-center justify-between mb-4";
  const cardTitleClass = "text-2xl font-bold text-gray-800";
  const buttonClass =
    "px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center";
  const tableClass = "min-w-full divide-y divide-gray-200";
  const tableHeaderClass = "bg-gray-900";
  const tableHeadClass =
    "px-6 py-3 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider";
  const tableCellClass = "px-6 py-4 whitespace-nowrap text-sm text-gray-900";
  const actionButtonClass =
    "p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500";

  let rowsContent;
  if (loading) {
    rowsContent = (
      <tr>
        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
          Loading assessments...
        </td>
      </tr>
    );
  } else if (error) {
    rowsContent = (
      <tr>
        <td colSpan="5" className="px-6 py-4 text-center text-red-600">
          Failed to load assessments.
        </td>
      </tr>
    );
  } else if (apiAssessments.length === 0) {
    rowsContent = (
      <tr>
        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
          {selectedCourse
            ? "No assessments for this course yet."
            : "No standalone assessments yet."}
        </td>
      </tr>
    );
  } else {
    rowsContent = apiAssessments.map((assessment) => (
      <tr key={assessment.id} className="odd:bg-white even:bg-gray-50">
        <td className={`${tableCellClass} font-medium`}>{assessment.name}</td>
        <td className={tableCellClass}>{assessment.description}</td>
        <td className={tableCellClass}>{assessment.questionCount}</td>
        <td className={tableCellClass}>{assessment.questionsToPresent}</td>
        <td className={`${tableCellClass} text-right`}>
          <button
            type="button"
            className={actionButtonClass}
            onClick={() => handleViewResults(assessment)}
          >
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <span className="sr-only">View results</span>
          </button>
          <button
            type="button"
            className={actionButtonClass}
            onClick={() => handleEditAssessment(assessment)}
          >
            <Edit className="h-4 w-4 text-gray-700" />
            <span className="sr-only">Edit</span>
          </button>
          <button
            type="button"
            className={actionButtonClass}
            onClick={() => handleDeleteAssessment(assessment.id)}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
            <span className="sr-only">Delete</span>
          </button>
        </td>
      </tr>
    ));
  }

  if (showForm) {
    return (
      <AssessmentForm
        assessment={editingAssessment}
        onSave={handleSaveAssessment}
        onCancel={handleCancelForm}
        courseId={selectedCourse?.id}
      />
    );
  }

  return (
    <>
      <div className={cardClass}>
        <div className={cardHeaderClass}>
          <h2 className={cardTitleClass}>
            {selectedCourse
              ? `Assessments for ${selectedCourse.name}`
              : `Standalone Assessments${
                  standaloneCategory || filterCategory
                    ? ` - ${standaloneCategory || filterCategory}`
                    : ""
                }`}
          </h2>
          <button
            type="button"
            onClick={handleAddAssessment}
            className={buttonClass}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Assessment
          </button>
        </div>
        <div>
          {/* Table for assessments */}
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead className={tableHeaderClass}>
                <tr>
                  <th scope="col" className={tableHeadClass}>
                    Name
                  </th>
                  <th scope="col" className={tableHeadClass}>
                    Description
                  </th>
                  <th scope="col" className={tableHeadClass}>
                    Total Questions
                  </th>
                  <th scope="col" className={tableHeadClass}>
                    Questions to Present
                  </th>
                  <th scope="col" className={`${tableHeadClass} text-right`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rowsContent}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {resultsAssessment && (
        <AssessmentResultsPanel
          assessment={resultsAssessment}
          onClose={() => setResultsAssessment(null)}
        />
      )}
    </>
  );
}
AssessmentsTab.propTypes = {
  selectedCourse: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
  }),
  standaloneCategory: PropTypes.string,
  filterCategory: PropTypes.string,
};

AssessmentsTab.defaultProps = {
  selectedCourse: null,
  standaloneCategory: "",
  filterCategory: "",
};

const formatDateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (seconds) => {
  if (seconds === null || seconds === undefined) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins <= 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
};

function AssessmentResultsPanel({ assessment, onClose }) {
  const assessmentId = assessment?.id;
  const {
    data: analyticsData,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetQuizAttemptsByAssessmentQuery(assessmentId, {
    skip: !assessmentId,
  });
  const [fetchAttemptDetail] = useLazyGetQuizAttemptByIdQuery();
  const [attemptDetails, setAttemptDetails] = useState({});
  const [attemptDetailErrors, setAttemptDetailErrors] = useState({});
  const [loadingAttemptId, setLoadingAttemptId] = useState(null);
  const [expandedAttemptId, setExpandedAttemptId] = useState(null);
  const [activeTab, setActiveTab] = useState("detailed"); // "detailed" or "summary"

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKey = (evt) => {
      if (evt.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  // Extract attempts array and analytics from the new response format
  const attemptList = analyticsData?.attempts || [];
  const analytics = analyticsData || {};

  // Calculate summarized performance (best attempt per user)
  const summarizedPerformance = useMemo(() => {
    const userBestAttempts = {};
    
    attemptList.forEach(attempt => {
      const userId = attempt.participantId;
      const percentage = attempt.percentage || 0;
      
      if (!userBestAttempts[userId] || percentage > userBestAttempts[userId].percentage) {
        userBestAttempts[userId] = {
          participantId: userId,
          bestAttempt: attempt,
          percentage: percentage,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          passed: attempt.passed,
          completedAt: attempt.completedAt,
          attemptNumber: attempt.attemptNumber,
          totalAttempts: attemptList.filter(a => a.participantId === userId).length
        };
      }
    });
    
    return Object.values(userBestAttempts).sort((a, b) => b.percentage - a.percentage);
  }, [attemptList]);

  // Export functions
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(`Assessment Results: ${assessment?.name || 'Assessment'}`, 14, 20);
    
    // Assessment info
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Assessment: ${assessment?.name || 'N/A'}`, 14, 35);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 45);
    
    // Statistics
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Overall Statistics', 14, 65);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const statsData = [
      ['Total Attempts', summary.totalAttempts.toString()],
      ['Unique Participants', summary.participants.toString()],
      ['Average Score', `${summary.avgScore}%`],
      ['Pass Rate', `${summary.passRate}%`]
    ];
    
    autoTable(doc, {
      startY: 75,
      head: [['Metric', 'Value']],
      body: statsData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14 }
    });
    
    // Summary Performance
    let summaryStartY = 140; // Fixed position to avoid finalY issues
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Best Performance Summary', 14, summaryStartY);
    
    const summaryTableData = summarizedPerformance.map((user, index) => [
      (index + 1).toString(),
      user.participantId,
      `${user.score}/${user.totalQuestions}`,
      `${user.percentage}%`,
      user.passed ? 'Pass' : 'Fail',
      user.totalAttempts.toString(),
      new Date(user.completedAt).toLocaleDateString()
    ]);
    
    autoTable(doc, {
      startY: summaryStartY + 10,
      head: [['Rank', 'Participant', 'Score', 'Percentage', 'Status', 'Total Attempts', 'Date']],
      body: summaryTableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14 },
      columnStyles: {
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' }
      }
    });
    
    // Save the PDF
    doc.save(`${assessment?.name || 'Assessment'}_Results_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToExcel = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Statistics sheet
    const statsData = [
      ['Assessment Results Report'],
      [''],
      ['Assessment:', assessment?.name || 'N/A'],
      ['Generated:', new Date().toLocaleDateString()],
      [''],
      ['Overall Statistics'],
      ['Total Attempts', summary.totalAttempts],
      ['Unique Participants', summary.participants],
      ['Average Score', `${summary.avgScore}%`],
      ['Pass Rate', `${summary.passRate}%`]
    ];
    
    const statsWs = XLSX.utils.aoa_to_sheet(statsData);
    XLSX.utils.book_append_sheet(wb, statsWs, 'Statistics');
    
    // Summary Performance sheet
    const summaryHeaders = ['Rank', 'Participant ID', 'Score', 'Total Questions', 'Percentage', 'Status', 'Total Attempts', 'Best Attempt Date'];
    const summaryData = summarizedPerformance.map((user, index) => [
      index + 1,
      user.participantId,
      user.score,
      user.totalQuestions,
      `${user.percentage}%`,
      user.passed ? 'Pass' : 'Fail',
      user.totalAttempts,
      new Date(user.completedAt).toLocaleDateString()
    ]);
    
    const summaryWs = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryData]);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary Performance');
    
    // Detailed Attempts sheet
    const detailedHeaders = ['Participant ID', 'Attempt Number', 'Score', 'Total Questions', 'Percentage', 'Status', 'Started At', 'Completed At', 'Duration (min)'];
    const detailedData = attemptList.map(attempt => [
      attempt.participantId,
      attempt.attemptNumber,
      attempt.score,
      attempt.totalQuestions,
      `${attempt.percentage}%`,
      attempt.passed ? 'Pass' : 'Fail',
      new Date(attempt.startedAt).toLocaleString(),
      new Date(attempt.completedAt).toLocaleString(),
      attempt.durationMinutes || 0
    ]);
    
    const detailedWs = XLSX.utils.aoa_to_sheet([detailedHeaders, ...detailedData]);
    XLSX.utils.book_append_sheet(wb, detailedWs, 'All Attempts');
    
    // Save the Excel file
    XLSX.writeFile(wb, `${assessment?.name || 'Assessment'}_Results_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const summary = useMemo(() => {
    // Use analytics data from backend if available, otherwise calculate from attempts
    if (analytics.totalAttempts !== undefined) {
      return {
        totalAttempts: analytics.totalAttempts || 0,
        participants: analytics.uniqueParticipants || 0,
        avgScore: Math.round(analytics.averageScore || 0),
        passRate: Math.round(analytics.passRate || 0),
      };
    }
    
    // Fallback to frontend calculation if analytics not available
    if (attemptList.length === 0) {
      return {
        totalAttempts: 0,
        participants: 0,
        avgScore: 0,
        passRate: 0,
      };
    }
    const participantIds = new Set();
    let scoreSum = 0;
    let passCount = 0;
    attemptList.forEach((attempt) => {
      if (attempt.participantId) participantIds.add(attempt.participantId);
      const pct = Number.isFinite(attempt.percentage)
        ? Math.round(attempt.percentage)
        : attempt.totalQuestions
        ? Math.round((attempt.score * 100) / attempt.totalQuestions)
        : 0;
      scoreSum += pct;
      if (attempt.passed) passCount += 1;
    });
    const avgScore = Math.round(scoreSum / attemptList.length);
    const passRate = Math.round((passCount / attemptList.length) * 100);
    return {
      totalAttempts: attemptList.length,
      participants: participantIds.size,
      avgScore,
      passRate,
    };
  }, [attemptList, analytics]);

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  const fetchAttemptDetails = async (attemptId) => {
    try {
      setAttemptDetailErrors((prev) => ({ ...prev, [attemptId]: false }));
      setLoadingAttemptId(attemptId);
      const details = await fetchAttemptDetail(attemptId).unwrap();
      setAttemptDetails((prev) => ({ ...prev, [attemptId]: details }));
    } catch (err) {
      setAttemptDetailErrors((prev) => ({ ...prev, [attemptId]: true }));
    } finally {
      setLoadingAttemptId(null);
    }
  };

  const handleToggleAttempt = (attemptId) => {
    const isClosing = expandedAttemptId === attemptId;
    setExpandedAttemptId(isClosing ? null : attemptId);
    if (isClosing) return;
    const hasAnswers =
      attemptDetails[attemptId]?.questionPerformances?.length ||
      attemptDetails[attemptId]?.answers?.length ||
      attemptList.find((a) => a.id === attemptId)?.answers?.length;
    if (!hasAnswers) {
      fetchAttemptDetails(attemptId);
    }
  };

  const summaryCards = [
    {
      label: "Total Attempts",
      value: summary.totalAttempts,
      icon: BarChart3,
      iconClass: "text-blue-600",
    },
    {
      label: "Unique Participants",
      value: summary.participants,
      icon: Users,
      iconClass: "text-purple-600",
    },
    {
      label: "Average Score",
      value: `${summary.avgScore}%`,
      icon: Target,
      iconClass: "text-amber-600",
    },
    {
      label: "Pass Rate",
      value: `${summary.passRate}%`,
      icon: BadgeCheck,
      iconClass: "text-emerald-600",
    },
  ];

  const renderAttemptAnswers = (attempt) => {
    // Handle both new format (questionPerformances) and legacy format (answers)
    const questionPerformances = attemptDetails[attempt.id]?.questionPerformances || [];
    const legacyAnswers = attemptDetails[attempt.id]?.answers || attempt.answers || [];
    
    // Convert questionPerformances to the expected answers format
    const answers = questionPerformances.length > 0 
      ? questionPerformances.map(perf => ({
          questionId: perf.questionId,
          questionText: perf.questionText,
          selectedAnswerId: perf.selectedAnswerId,
          selectedAnswerText: perf.selectedAnswerText || (perf.selectedAnswerId ? 
            perf.options?.find(opt => opt.id === perf.selectedAnswerId)?.text : "No answer"),
          correctAnswerId: perf.correctAnswerId,
          correctAnswerText: perf.correctAnswerText,
          isCorrect: perf.correct,
          options: perf.options || []
        }))
      : legacyAnswers;
    
    if (loadingAttemptId === attempt.id) {
      return (
        <div className="flex items-center justify-center py-6 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading attempt details...
        </div>
      );
    }
    if (attemptDetailErrors[attempt.id]) {
      return (
        <div className="flex items-center justify-between p-4 bg-red-50 text-red-700 rounded-lg">
          <p className="text-sm">Failed to load questions for this attempt.</p>
          <button
            type="button"
            onClick={() => fetchAttemptDetails(attempt.id)}
            className="px-3 py-1 text-sm font-semibold bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      );
    }
    if (!answers || answers.length === 0) {
      return (
        <p className="text-sm text-gray-500">
          No question level data available for this attempt.
        </p>
      );
    }
    return (
      <ul className="divide-y divide-gray-200">
        {answers.map((answer, index) => {
          const isCorrect =
            typeof answer.isCorrect === "boolean"
              ? answer.isCorrect
              : answer.selectedOptionId !== undefined &&
                answer.correctOptionId !== undefined
              ? answer.selectedOptionId === answer.correctOptionId
              : undefined;
          const questionText =
            answer.questionText ||
            answer.question?.text ||
            `Question ${index + 1}`;
          const selectedText =
            answer.selectedOptionText ||
            answer.selectedAnswerText ||
            (typeof answer.selectedAnswer === "string"
              ? answer.selectedAnswer
              : null) ||
            (typeof answer.selectedAnswer === "number"
              ? `Option ${answer.selectedAnswer + 1}`
              : "No answer");
          const correctText =
            answer.correctOptionText ||
            answer.correctAnswerText ||
            "Not provided";
          const Icon = isCorrect ? CheckCircle : XCircle;
          const iconClass = isCorrect ? "text-emerald-500" : "text-rose-500";
          return (
            <li
              key={`${attempt.id}-${answer.questionId || index}`}
              className="py-3"
            >
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 flex-shrink-0 ${iconClass}`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-1">
                    {questionText}
                  </p>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <p>
                      <span className="font-semibold text-gray-700">
                        Selected:
                      </span>{" "}
                      {selectedText || "No answer"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-700">
                        Correct:
                      </span>{" "}
                      {correctText}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isCorrect
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {isCorrect ? "Correct" : "Incorrect"}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  let bodyContent;
  if (isFetching) {
    bodyContent = (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading assessment results...
      </div>
    );
  } else if (isError) {
    // If backend returns 404, treat it as "no attempts yet" instead of a hard error
    const status = error && (error.status ?? error.originalStatus);
    if (status === 404) {
      bodyContent = (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
          No attempts have been recorded for this assessment yet.
        </div>
      );
    } else {
      // Log full error in console for easier debugging
      // eslint-disable-next-line no-console
      console.error("Failed to load assessment results", error);
      bodyContent = (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          <p className="font-semibold mb-2">
            Unable to load assessment results.
          </p>
          <p className="text-sm mb-2">
            {(error && (error.data?.message || error.error)) ||
              "Please try again."}
          </p>
          {status && (
            <p className="text-xs text-red-500 mb-3">Status: {status}</p>
          )}
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }
  } else if (attemptList.length === 0) {
    bodyContent = (
      <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
        No attempts have been recorded for this assessment yet.
      </div>
    );
  } else {
    bodyContent = (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  {card.label}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {card.value}
                </p>
              </div>
              <card.icon className={`h-8 w-8 ${card.iconClass}`} />
            </div>
          ))}
        </div>
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex space-x-8">
                <button
                  type="button"
                  onClick={() => setActiveTab("detailed")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "detailed"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Detailed View ({attemptList.length} attempts)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("summary")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "summary"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Summary View ({summarizedPerformance.length} users)
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportToPDF}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FileText className="h-4 w-4" />
                  Export PDF
                </button>
                <button
                  type="button"
                  onClick={exportToExcel}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Table className="h-4 w-4" />
                  Export Excel
                </button>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "detailed" ? (
            <div className="divide-y divide-gray-200">
            {attemptList.map((attempt) => {
              const participantName =
                attempt.participantName ||
                attempt.participant?.fullName ||
                attempt.participant?.username ||
                attempt.participantId ||
                "Unknown User";
              const percent = Number.isFinite(attempt.percentage)
                ? Math.round(attempt.percentage)
                : attempt.totalQuestions
                ? Math.round((attempt.score * 100) / attempt.totalQuestions)
                : 0;
              const badgeClass = attempt.passed
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700";
              const badgeText = attempt.passed ? "Passed" : "Failed";
              const isExpanded = expandedAttemptId === attempt.id;
              return (
                <div key={attempt.id}>
                  <button
                    type="button"
                    onClick={() => handleToggleAttempt(attempt.id)}
                    className="w-full px-4 py-4 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                          <UserCircle className="h-4 w-4 text-gray-400" />
                          {participantName}
                        </span>
                        <span className="text-xs text-gray-500">
                          Attempt #{attempt.attemptNumber || attempt.id}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}
                        >
                          {badgeText}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                          {percent}%
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-2">
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {formatDateTime(attempt.completedAt)}
                        </span>
                        {attempt.durationSeconds !== undefined && (
                          <span className="inline-flex items-center gap-1">
                            <Timer className="h-3.5 w-3.5" />
                            {formatDuration(attempt.durationSeconds)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700">
                        {attempt.score}/{attempt.totalQuestions}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="bg-gray-50 border-t border-gray-200 px-4 py-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Question performance
                      </h4>
                      {renderAttemptAnswers(attempt)}
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          ) : (
            /* Summary View */
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Best Performance Summary
                </h3>
                <p className="text-sm text-gray-600">
                  Showing the best attempt for each participant, ranked by performance.
                </p>
              </div>
              
              {summarizedPerformance.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No performance data available.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Participant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Best Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Attempts
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Best Attempt Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {summarizedPerformance.map((user, index) => (
                        <tr key={user.participantId} className={index < 3 ? "bg-yellow-50" : ""}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {index === 0 && <Award className="h-5 w-5 text-yellow-500 mr-2" />}
                              {index === 1 && <Award className="h-5 w-5 text-gray-400 mr-2" />}
                              {index === 2 && <Award className="h-5 w-5 text-amber-600 mr-2" />}
                              <span className="text-sm font-medium text-gray-900">
                                #{index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <UserCircle className="h-8 w-8 text-gray-400 mr-3" />
                              <span className="text-sm font-medium text-gray-900">
                                {user.participantId}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.score}/{user.totalQuestions}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.percentage >= 80 ? "bg-green-100 text-green-800" :
                              user.percentage >= 60 ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {user.percentage}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>
                              {user.passed ? "Pass" : "Fail"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.totalAttempts}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.completedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-10"
      onClick={handleOverlayClick}
    >
      <div className="bg-gray-50 w-full max-w-5xl h-full max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-white px-6 py-5 border-b border-gray-200 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
              Assessment results
            </p>
            <h3 className="text-2xl font-bold text-gray-900">
              {assessment?.name}
            </h3>
            {assessment?.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {assessment.description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
            aria-label="Close results panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{bodyContent}</div>
      </div>
    </div>
  );
}

AssessmentResultsPanel.propTypes = {
  assessment: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
