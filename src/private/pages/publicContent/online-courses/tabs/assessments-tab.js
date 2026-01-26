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
  useAwardMarksForStructuredQuestionMutation,
  useGetStandaloneAssessmentsQuery,
  useCreateAssessmentMutation,
  useUpdateAssessmentMutation,
  useDeleteAssessmentMutation,
  useGetQuizAttemptsByAssessmentQuery,
  useLazyGetQuizAttemptByIdQuery,
  useRecalculateAssessmentAttemptsMutation,
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
        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
          Loading assessments...
        </td>
      </tr>
    );
  } else if (error) {
    rowsContent = (
      <tr>
        <td colSpan="6" className="px-6 py-4 text-center text-red-600">
          Failed to load assessments.
        </td>
      </tr>
    );
  } else if (apiAssessments.length === 0) {
    rowsContent = (
      <tr>
        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
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
        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs break-words whitespace-normal">
          {assessment.description || "—"}
        </td>
        <td className={tableCellClass}>{assessment.questionCount}</td>
        <td className={tableCellClass}>{assessment.questionsToPresent || 0}</td>
        <td className={tableCellClass}>
          {assessment.mandatoryStructuredCount || 0}
        </td>
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
          <div className="overflow-x-auto max-w-full">
            <table className={`${tableClass} w-full table-auto`}>
              <thead className={tableHeaderClass}>
                <tr>
                  <th scope="col" className={tableHeadClass}>
                    Name
                  </th>
                  <th scope="col" className={`${tableHeadClass} max-w-xs`}>
                    Description
                  </th>
                  <th scope="col" className={tableHeadClass}>
                    Total Questions
                  </th>
                  <th scope="col" className={tableHeadClass}>
                    Objective Questions
                  </th>
                  <th scope="col" className={tableHeadClass}>
                    Structured Questions
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
  const [awardMarks] = useAwardMarksForStructuredQuestionMutation();
  const [recalculateAttempts, { isLoading: isRecalculating }] = useRecalculateAssessmentAttemptsMutation();
  const [attemptDetails, setAttemptDetails] = useState({});
  const [attemptDetailErrors, setAttemptDetailErrors] = useState({});
  const [loadingAttemptId, setLoadingAttemptId] = useState(null);
  const [expandedAttemptId, setExpandedAttemptId] = useState(null);
  const [activeTab, setActiveTab] = useState("detailed"); // "detailed" or "summary"
  const [marksEditing, setMarksEditing] = useState({}); // Track which questions are being edited
  const [marksData, setMarksData] = useState({}); // Store marks input: { attemptId-questionId: { awarded: number, max: number } }

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

    attemptList.forEach((attempt) => {
      const userId = attempt.participantId;
      const percentage = attempt.percentage || 0;

      if (
        !userBestAttempts[userId] ||
        percentage > userBestAttempts[userId].percentage
      ) {
        userBestAttempts[userId] = {
          participantId: userId,
          bestAttempt: attempt,
          percentage: percentage,
          score: attempt.score,
          totalMarks: attempt.totalMarks || attempt.totalQuestions, // Use totalMarks if available, fallback to totalQuestions
          totalQuestions: attempt.totalQuestions,
          passed: percentage >= 70, // Match report pass/fail threshold (70%)
          completedAt: attempt.completedAt,
          attemptNumber: attempt.attemptNumber,
          totalAttempts: attemptList.filter((a) => a.participantId === userId)
            .length,
        };
      }
    });

    return Object.values(userBestAttempts).sort(
      (a, b) => b.percentage - a.percentage
    );
  }, [attemptList]);

  // Export functions
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text(`Assessment Results: ${assessment?.name || "Assessment"}`, 14, 20);

    // Assessment info
    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.text(`Assessment: ${assessment?.name || "N/A"}`, 14, 35);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 45);

    // Statistics
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Overall Statistics", 14, 65);

    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    const statsData = [
      ["Total Attempts", summary.totalAttempts.toString()],
      ["Unique Participants", summary.participants.toString()],
      ["Average Score", `${summary.avgScore}%`],
      ["Pass Rate", `${summary.passRate}%`],
    ];

    autoTable(doc, {
      startY: 75,
      head: [["Metric", "Value"]],
      body: statsData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14 },
    });

    // Summary Performance
    let summaryStartY = 140; // Fixed position to avoid finalY issues
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Best Performance Summary", 14, summaryStartY);

    const summaryTableData = summarizedPerformance.map((user, index) => [
      (index + 1).toString(),
      user.participantId,
      `${Math.round(user.score * 100) / 100}/${
        user.totalMarks
          ? Math.round(user.totalMarks * 100) / 100
          : user.totalQuestions
      }`,
      `${user.percentage}%`,
      user.passed ? "Pass" : "Fail",
      user.totalAttempts.toString(),
      new Date(user.completedAt).toLocaleDateString(),
    ]);

    autoTable(doc, {
      startY: summaryStartY + 10,
      head: [
        [
          "Rank",
          "Participant",
          "Score",
          "Percentage",
          "Status",
          "Total Attempts",
          "Date",
        ],
      ],
      body: summaryTableData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14 },
      columnStyles: {
        3: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "center" },
      },
    });

    // Save the PDF
    doc.save(
      `${assessment?.name || "Assessment"}_Results_${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );
  };

  const exportToExcel = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Statistics sheet
    const statsData = [
      ["Assessment Results Report"],
      [""],
      ["Assessment:", assessment?.name || "N/A"],
      ["Generated:", new Date().toLocaleDateString()],
      [""],
      ["Overall Statistics"],
      ["Total Attempts", summary.totalAttempts],
      ["Unique Participants", summary.participants],
      ["Average Score", `${summary.avgScore}%`],
      ["Pass Rate", `${summary.passRate}%`],
    ];

    const statsWs = XLSX.utils.aoa_to_sheet(statsData);
    XLSX.utils.book_append_sheet(wb, statsWs, "Statistics");

    // Summary Performance sheet
    const summaryHeaders = [
      "Rank",
      "Participant ID",
      "Score",
      "Total Marks",
      "Percentage",
      "Status",
      "Total Attempts",
      "Best Attempt Date",
    ];
    const summaryData = summarizedPerformance.map((user, index) => [
      index + 1,
      user.participantId,
      Math.round(user.score * 100) / 100,
      user.totalMarks
        ? Math.round(user.totalMarks * 100) / 100
        : user.totalQuestions,
      `${user.percentage}%`,
      user.passed ? "Pass" : "Fail",
      user.totalAttempts,
      new Date(user.completedAt).toLocaleDateString(),
    ]);

    const summaryWs = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryData]);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary Performance");

    // Detailed Attempts sheet
    const detailedHeaders = [
      "Participant ID",
      "Attempt Number",
      "Score",
      "Total Questions",
      "Percentage",
      "Status",
      "Started At",
      "Completed At",
      "Duration (min)",
    ];
    const detailedData = attemptList.map((attempt) => {
      const pct = Number.isFinite(attempt.percentage)
        ? Math.round(attempt.percentage)
        : attempt.totalQuestions
        ? Math.round((attempt.score * 100) / attempt.totalQuestions)
        : 0;
      return [
        attempt.participantId,
        attempt.attemptNumber,
        attempt.score,
        attempt.totalQuestions,
        `${pct}%`,
        pct >= 70 ? "Pass" : "Fail", // Match report pass/fail threshold (70%)
        new Date(attempt.startedAt).toLocaleString(),
        new Date(attempt.completedAt).toLocaleString(),
        attempt.durationMinutes || 0,
      ];
    });

    const detailedWs = XLSX.utils.aoa_to_sheet([
      detailedHeaders,
      ...detailedData,
    ]);
    XLSX.utils.book_append_sheet(wb, detailedWs, "All Attempts");

    // Save the Excel file
    XLSX.writeFile(
      wb,
      `${assessment?.name || "Assessment"}_Results_${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );
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
      // Match report pass/fail threshold (70%)
      if (pct >= 70) passCount += 1;
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

  // Export assessment report as PDF
  const exportReportToPDF = async (attempt) => {
    const questionPerformances =
      attemptDetails[attempt.id]?.questionPerformances || [];
    const legacyAnswers =
      attemptDetails[attempt.id]?.answers || attempt.answers || [];
    const answers =
      questionPerformances.length > 0 ? questionPerformances : legacyAnswers;

    // Calculate report metrics (same as renderAssessmentReport)
    // Prioritize attempt.totalQuestions, then assessment.questionCount, then answers.length
    // Ensure totalQuestions is a count (integer), not marks
    let totalQuestions =
      attempt.totalQuestions ||
      assessment?.questionCount ||
      answers.length ||
      0;
    // Validate: ensure it's a number and not accidentally maxMarks
    totalQuestions = Math.max(0, Math.round(Number(totalQuestions) || 0));
    const score = attempt.score || 0;

    // Use totalMarks from backend if available, otherwise calculate from answers
    let totalMarks = 0;
    let maxMarks = attempt.totalMarks || 0; // Use backend totalMarks if available

    let negativeMarks = 0;
    let correctCount = 0;
    let partiallyCorrectCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    // If totalMarks is not set from backend, calculate from answers
    if (!maxMarks || maxMarks === 0) {
      answers.forEach((answer) => {
        const questionMarks = answer.questionMarks || answer.maxMarks || 1.0;
        maxMarks += questionMarks;
      });
    }

    // Calculate total marks earned and counts
    let answeredQuestionsCount = 0;
    answers.forEach((answer) => {
      const isStructured =
        answer.questionType === "structured" ||
        answer.question?.questionType === "structured" ||
        !answer.options ||
        (Array.isArray(answer.options) && answer.options.length === 0);

      if (isStructured) {
        // Check if structured question has an answer (structuredAnswer) or has been graded (awardedMarks)
        const hasStructuredAnswer =
          answer.structuredAnswer && answer.structuredAnswer.trim() !== "";
        const hasAwardedMarks =
          answer.awardedMarks !== null && answer.awardedMarks !== undefined;

        if (hasAwardedMarks) {
          totalMarks += answer.awardedMarks;
          answeredQuestionsCount++;
          if (
            answer.awardedMarks > 0 &&
            answer.awardedMarks < (answer.maxMarks || answer.questionMarks || 0)
          ) {
            partiallyCorrectCount++;
          } else if (
            answer.awardedMarks >=
            (answer.maxMarks || answer.questionMarks || 0)
          ) {
            correctCount++;
          } else {
            incorrectCount++;
          }
        } else if (hasStructuredAnswer) {
          // Has answer but not yet graded - count as answered
          answeredQuestionsCount++;
        }
      } else {
        const isCorrect =
          answer.isCorrect ||
          (answer.selectedOptionId !== null &&
            answer.selectedOptionId === answer.correctOptionId);

        const questionMarks = answer.questionMarks || answer.maxMarks || 1.0;

        if (
          answer.selectedOptionId !== null &&
          answer.selectedOptionId !== undefined
        ) {
          answeredQuestionsCount++;
          if (isCorrect) {
            correctCount++;
            totalMarks += questionMarks; // Use actual question marks, not hardcoded 1
          } else {
            incorrectCount++;
            negativeMarks += 0.25;
          }
        }
      }
    });

    // Calculate unanswered as total questions minus answered questions
    // Ensure totalQuestions is a valid integer count (not marks)
    const validTotalQuestions = Math.max(
      0,
      Math.round(Number(totalQuestions) || 0)
    );
    const validAnsweredCount = Math.max(
      0,
      Math.round(Number(answeredQuestionsCount) || 0)
    );
    // Ensure unansweredCount is never negative and is a valid integer count
    unansweredCount = Math.max(0, validTotalQuestions - validAnsweredCount);

    // Calculate percentage using total marks, not question count
    const percentage =
      attempt.percentage ||
      (maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0);
    const passFail = percentage >= 70 ? "Pass" : "Fail";

    const timeTaken = attempt.durationSeconds
      ? formatDuration(attempt.durationSeconds)
      : attempt.durationMinutes
      ? `${attempt.durationMinutes} minutes`
      : "—";

    const attemptNumber = attempt.attemptNumber || 1;
    const attemptDate = attempt.completedAt
      ? formatDateTime(attempt.completedAt)
      : attempt.createdAt
      ? formatDateTime(attempt.createdAt)
      : "—";

    // Get participant information
    const participantName =
      attempt.participantName ||
      attempt.participant?.fullName ||
      attempt.participant?.username ||
      attempt.participantId ||
      "Unknown User";

    // Create PDF
    const doc = new jsPDF();

    // Load and add logo
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = "/caa_logo.png";

      await new Promise((resolve, reject) => {
        logoImg.onload = () => {
          try {
            // Add logo to PDF (left side, top)
            const logoWidth = 25;
            const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
            doc.addImage(logoImg, "PNG", 20, 8, logoWidth, logoHeight);
            resolve();
          } catch (error) {
            console.error("Error adding logo to PDF:", error);
            resolve(); // Continue even if logo fails
          }
        };
        logoImg.onerror = () => {
          console.warn("Logo image failed to load, continuing without logo");
          resolve(); // Continue even if logo fails
        };
      });
    } catch (error) {
      console.warn("Error loading logo:", error);
    }

    // Header with text (matching screenshot format)
    // MANSOPS PART III - AIM (centered)
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0); // Black
    doc.text("MANSOPS PART III - AIM", 105, 12, { align: "center" });

    // Appendix 4 (right side)
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Appendix 4", 190, 12, { align: "right" });

    // Main title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("ONLINE KNOWLEDGE/PROFICIENCY ASSESSMENT REPORT", 105, 25, {
      align: "center",
    });

    // Subtitle
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Scorecard | ${assessment.name} – ${attemptDate} (${attemptNumber}${
        attemptNumber === 1
          ? "st"
          : attemptNumber === 2
          ? "nd"
          : attemptNumber === 3
          ? "rd"
          : "th"
      } attempt)`,
      105,
      32,
      { align: "center" }
    );

    // Participant information
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Participant: ${participantName}`, 105, 38, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Applicable to each competency", 105, 44, { align: "center" });

    // Ensure numeric values are valid
    const safeScore = Number(score) || 0;
    const safeMaxMarks = Number(maxMarks) || 0;
    const safeTimeTaken = timeTaken || "—";

    // Report table data
    const tableData = [
      ["1", "Score", `${percentage}%`],
      ["2", "Pass/fail", passFail],
      ["3", "Total number of questions", totalQuestions.toString()],
      ["4", "Marks", `${safeScore.toFixed(2)} / ${safeMaxMarks.toFixed(2)}`],
      ["5", "Negative marks", "0"],
      ["6", "Time taken", safeTimeTaken],
      ["7", "Number of correct", safeScore.toFixed(2)],
      ["8", "Number of partially correct", partiallyCorrectCount.toString()],
      ["9", "Number incorrect", (safeMaxMarks - safeScore).toFixed(2)],
      ["10", "Number unanswered", "0"],
      ["11", "Section-wise summary", "Use present style"],
    ];

    // Add table (adjusted startY to account for new header layout)
    autoTable(doc, {
      startY: 48,
      head: [["Nr", "Item", "Result"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [243, 244, 246],
        textColor: [55, 65, 81],
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        textColor: [55, 65, 81],
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: 20, halign: "left" },
        1: { cellWidth: 120, halign: "left" },
        2: { cellWidth: 50, halign: "left" },
      },
      margin: { left: 20, right: 20 },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");

      // Footer text
      const footerY = doc.internal.pageSize.height - 20;
      doc.text("UCAA/DANS/AIM/OF/88a", 20, footerY);
      doc.text("APP 4-267", 105, footerY, { align: "center" });
      doc.text(`Rev 00, date 01/01/2026`, 190, footerY, { align: "right" });

      doc.setFont("helvetica", "italic");
      doc.text(
        "This is a controlled document and must be checked against the master documents list for the latest revision level",
        105,
        footerY + 6,
        { align: "center", maxWidth: 170 }
      );
    }

    // Save PDF
    const fileName = `Assessment_Report_${assessment.name.replace(
      /\s+/g,
      "_"
    )}_${attempt.participantId}_${attemptNumber}.pdf`;
    doc.save(fileName);
  };

  // Render the assessment report based on the template
  const renderAssessmentReport = (attempt) => {
    const questionPerformances =
      attemptDetails[attempt.id]?.questionPerformances || [];
    const legacyAnswers =
      attemptDetails[attempt.id]?.answers || attempt.answers || [];
    const answers =
      questionPerformances.length > 0 ? questionPerformances : legacyAnswers;

    // Calculate report metrics
    // Prioritize attempt.totalQuestions, then assessment.questionCount, then answers.length
    // Ensure totalQuestions is a count (integer), not marks
    let totalQuestions =
      attempt.totalQuestions ||
      assessment?.questionCount ||
      answers.length ||
      0;
    // Validate: ensure it's a number and not accidentally maxMarks
    totalQuestions = Math.max(0, Math.round(Number(totalQuestions) || 0));
    const score = attempt.score || 0;

    // Use totalMarks from backend if available, otherwise calculate from answers
    let totalMarks = 0;
    let maxMarks = attempt.totalMarks || 0; // Use backend totalMarks if available
    let negativeMarks = 0;

    // Count question types
    let correctCount = 0;
    let partiallyCorrectCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    // If totalMarks is not set from backend, calculate from answers
    if (!maxMarks || maxMarks === 0) {
      answers.forEach((answer) => {
        const questionMarks = answer.questionMarks || answer.maxMarks || 1.0;
        maxMarks += questionMarks;
      });
    }

    // Calculate total marks earned and counts
    let answeredQuestionsCount = 0;
    answers.forEach((answer) => {
      const isStructured =
        answer.questionType === "structured" ||
        answer.question?.questionType === "structured" ||
        !answer.options ||
        (Array.isArray(answer.options) && answer.options.length === 0);

      if (isStructured) {
        // Check if structured question has an answer (structuredAnswer) or has been graded (awardedMarks)
        const hasStructuredAnswer =
          answer.structuredAnswer && answer.structuredAnswer.trim() !== "";
        const hasAwardedMarks =
          answer.awardedMarks !== null && answer.awardedMarks !== undefined;

        if (hasAwardedMarks) {
          totalMarks += answer.awardedMarks;
          answeredQuestionsCount++;
          if (
            answer.awardedMarks > 0 &&
            answer.awardedMarks < (answer.maxMarks || answer.questionMarks || 0)
          ) {
            partiallyCorrectCount++;
          } else if (
            answer.awardedMarks >=
            (answer.maxMarks || answer.questionMarks || 0)
          ) {
            correctCount++;
          } else {
            incorrectCount++;
          }
        } else if (hasStructuredAnswer) {
          // Has answer but not yet graded - count as answered
          answeredQuestionsCount++;
        }
      } else {
        // For multiple choice questions
        const isCorrect =
          answer.isCorrect ||
          (answer.selectedOptionId !== null &&
            answer.selectedOptionId === answer.correctOptionId);

        const questionMarks = answer.questionMarks || answer.maxMarks || 1.0;

        if (
          answer.selectedOptionId !== null &&
          answer.selectedOptionId !== undefined
        ) {
          answeredQuestionsCount++;
          if (isCorrect) {
            correctCount++;
            totalMarks += questionMarks; // Use actual question marks, not hardcoded 1
          } else {
            incorrectCount++;
            // Negative marking if applicable (assuming 0.25 negative marks per wrong answer)
            negativeMarks += 0.25;
          }
        }
      }
    });

    // Calculate unanswered as total questions minus answered questions
    // Ensure totalQuestions is a valid integer count (not marks)
    const validTotalQuestions = Math.max(
      0,
      Math.round(Number(totalQuestions) || 0)
    );
    const validAnsweredCount = Math.max(
      0,
      Math.round(Number(answeredQuestionsCount) || 0)
    );
    // Ensure unansweredCount is never negative and is a valid integer count
    unansweredCount = Math.max(0, validTotalQuestions - validAnsweredCount);

    // Calculate percentage using total marks, not question count
    const percentage =
      attempt.percentage ||
      (maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0);
    const passFail = percentage >= 70 ? "Pass" : "Fail";

    const timeTaken = attempt.durationSeconds
      ? formatDuration(attempt.durationSeconds)
      : attempt.durationMinutes
      ? `${attempt.durationMinutes} minutes`
      : "—";

    const attemptNumber = attempt.attemptNumber || 1;
    const attemptDate = attempt.completedAt
      ? formatDateTime(attempt.completedAt)
      : attempt.createdAt
      ? formatDateTime(attempt.createdAt)
      : "—";

    return (
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-6">
        {/* Report Header */}
        <div className="bg-gray-100 border-b border-gray-300 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Logo and header section matching screenshot */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <img
                    src="/caa_logo.png"
                    alt="CAA Logo"
                    className="h-12 w-auto"
                    onError={(e) => {
                      console.error("Failed to load logo");
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <div className="flex-1 text-center">
                  <h4 className="text-sm font-bold text-gray-900">
                    MANSOPS PART III - AIM
                  </h4>
                </div>
                <div className="text-sm font-bold text-gray-900">
                  Appendix 4
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center">
                ONLINE KNOWLEDGE/PROFICIENCY ASSESSMENT REPORT
              </h3>
              <p className="text-sm text-gray-600 mt-1 text-center">
                Scorecard | {assessment.name} – {attemptDate} ({attemptNumber}
                {attemptNumber === 1
                  ? "st"
                  : attemptNumber === 2
                  ? "nd"
                  : attemptNumber === 3
                  ? "rd"
                  : "th"}{" "}
                attempt)
              </p>
              <p className="text-xs text-gray-500 mt-1 italic text-center">
                Applicable to each competency
              </p>
            </div>
            <div className="ml-4">
              <button
                onClick={() => exportReportToPDF(attempt)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Report Table */}
        <div className="px-6 py-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-16">
                  Nr
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Result
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">1</td>
                <td className="px-4 py-3 text-sm text-gray-700">Score</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  {percentage}%
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">2</td>
                <td className="px-4 py-3 text-sm text-gray-700">Pass/fail</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      passFail === "Pass"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {passFail}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">3</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  Total number of questions
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  {totalQuestions}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">4</td>
                <td className="px-4 py-3 text-sm text-gray-700">Marks</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  {score.toFixed(2)} / {maxMarks.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">5</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  Negative marks
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  0
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">6</td>
                <td className="px-4 py-3 text-sm text-gray-700">Time taken</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  {timeTaken}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">7</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  Number of correct
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-green-600">
                  {score}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">8</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  Number of partially correct
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-amber-600">
                  {partiallyCorrectCount}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">9</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  Number incorrect
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-red-600">
                  {(maxMarks - score).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">10</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  Number unanswered
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-600">
                  0
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">11</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  Section-wise summary
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 italic">
                  Use present style
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Report Footer */}
        <div className="bg-gray-50 border-t border-gray-300 px-6 py-3">
          <div className="flex justify-between items-center text-xs text-gray-600">
            <div>UCAA/DANS/AIM/OF/88a</div>
            <div>APP 4-267</div>
            <div>
              Rev 00, date{" "}
              {new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 italic text-center">
            This is a controlled document and must be checked against the master
            documents list for the latest revision level
          </p>
        </div>
      </div>
    );
  };

  const renderAttemptAnswers = (attempt) => {
    // Handle both new format (questionPerformances) and legacy format (answers)
    const questionPerformances =
      attemptDetails[attempt.id]?.questionPerformances || [];
    const legacyAnswers =
      attemptDetails[attempt.id]?.answers || attempt.answers || [];

    // Convert questionPerformances to the expected answers format
    const answers =
      questionPerformances.length > 0
        ? questionPerformances.map((perf) => {
            // Better detection of question type - prioritize explicit questionType
            const hasOptions =
              perf.options &&
              Array.isArray(perf.options) &&
              perf.options.length > 0;
            const hasStructuredAnswer =
              perf.structuredAnswer && perf.structuredAnswer.trim() !== "";
            const hasSelectedOption =
              perf.selectedAnswerId !== null &&
              perf.selectedAnswerId !== undefined;

            // Detection priority:
            // 1. Explicit questionType from API
            // 2. If structuredAnswer exists, it's structured
            // 3. If no options and no selectedAnswerId, it's structured
            // 4. Otherwise, it's multiple_choice
            const detectedType =
              perf.questionType ||
              perf.question?.questionType ||
              (hasStructuredAnswer
                ? "structured"
                : !hasOptions && !hasSelectedOption
                ? "structured"
                : "MCQ");

            // Extract selected answer text - check multiple sources for better coverage
            const selectedOptionText =
              perf.selectedAnswerText ||
              (perf.selectedAnswerId && perf.options
                ? perf.options.find((opt) => opt.id === perf.selectedAnswerId)
                    ?.text ||
                  perf.options.find((opt) => opt.id === perf.selectedAnswerId)
                    ?.optionText
                : null);

            // Extract correct answer text
            const correctOptionText =
              perf.correctAnswerText ||
              (perf.correctAnswerId && perf.options
                ? perf.options.find((opt) => opt.id === perf.correctAnswerId)
                    ?.text ||
                  perf.options.find((opt) => opt.id === perf.correctAnswerId)
                    ?.optionText
                : null);

            return {
              questionId: perf.questionId,
              questionText: perf.questionText,
              questionType: detectedType,
              selectedAnswerId: perf.selectedAnswerId,
              selectedOptionId: perf.selectedAnswerId,
              selectedAnswerText: selectedOptionText,
              selectedOptionText: selectedOptionText,
              structuredAnswer:
                perf.structuredAnswer ||
                perf.answerText ||
                (detectedType === "structured"
                  ? perf.selectedAnswerText
                  : null),
              correctAnswerId: perf.correctAnswerId,
              correctOptionId: perf.correctAnswerId,
              correctAnswerText: correctOptionText,
              correctOptionText: correctOptionText,
              isCorrect: perf.correct,
              awardedMarks: perf.awardedMarks || perf.markAwarded,
              maxMarks: perf.maxMarks || perf.questionMarks,
              options: perf.options || [],
            };
          })
        : legacyAnswers.map((ans) => {
            // Better detection for legacy answers too
            const hasOptions =
              ans.options &&
              Array.isArray(ans.options) &&
              ans.options.length > 0;
            const hasStructuredAnswer =
              ans.structuredAnswer && ans.structuredAnswer.trim() !== "";
            const hasSelectedOption =
              ans.selectedOptionId !== null &&
              ans.selectedOptionId !== undefined;

            // Same detection priority as new format
            const detectedType =
              ans.questionType ||
              ans.question?.questionType ||
              (hasStructuredAnswer
                ? "structured"
                : !hasOptions && !hasSelectedOption
                ? "structured"
                : "MCQ");

            // Extract answer text for legacy format
            const selectedOptionText =
              ans.selectedOptionText ||
              ans.selectedAnswerText ||
              (ans.selectedOptionId && ans.options
                ? ans.options.find((opt) => opt.id === ans.selectedOptionId)
                    ?.text ||
                  ans.options.find((opt) => opt.id === ans.selectedOptionId)
                    ?.optionText
                : null);

            const correctOptionText =
              ans.correctOptionText ||
              ans.correctAnswerText ||
              (ans.correctOptionId && ans.options
                ? ans.options.find((opt) => opt.id === ans.correctOptionId)
                    ?.text ||
                  ans.options.find((opt) => opt.id === ans.correctOptionId)
                    ?.optionText
                : null);

            return {
              ...ans,
              questionType: detectedType,
              selectedOptionText: selectedOptionText,
              selectedAnswerText: selectedOptionText,
              structuredAnswer:
                ans.structuredAnswer ||
                (detectedType === "structured" ? ans.selectedAnswerText : null),
              correctOptionText: correctOptionText,
              correctAnswerText: correctOptionText,
              awardedMarks: ans.awardedMarks,
              maxMarks: ans.maxMarks,
            };
          });

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
    const handleSaveMarks = async (
      attemptId,
      questionId,
      awardedMarks,
      maxMarks
    ) => {
      try {
        await awardMarks({
          attemptId,
          questionId,
          awardedMarks: Number(awardedMarks),
          maxMarks: Number(maxMarks),
        }).unwrap();

        // Update local state
        const key = `${attemptId}-${questionId}`;
        setMarksEditing((prev) => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });

        // Refresh attempt details and main attempts list to update scores
        fetchAttemptDetails(attemptId);
        refetch(); // Refresh the main attempts list to update score/totalMarks display
      } catch (error) {
        console.error("Error awarding marks:", error);
        alert("Failed to save marks. Please try again.");
      }
    };

    return (
      <ul className="divide-y divide-gray-200">
        {answers.map((answer, index) => {
          // Detect structured questions: check questionType first, then fallback to checking if it has options
          const hasOptions =
            answer.options &&
            Array.isArray(answer.options) &&
            answer.options.length > 0;
          const hasSelectedOption =
            answer.selectedOptionId !== null &&
            answer.selectedOptionId !== undefined;
          const hasCorrectOption =
            answer.correctOptionId !== null &&
            answer.correctOptionId !== undefined;
          // Also check if structuredAnswer exists as a strong indicator
          const hasStructuredAnswer =
            answer.structuredAnswer && answer.structuredAnswer.trim() !== "";

          // More robust detection: prioritize questionType, then check for structuredAnswer, then check for absence of options
          // If questionType is explicitly set to "structured", it's structured
          // If structuredAnswer exists, it's structured
          // If no options AND no selectedOptionId AND no correctOptionId AND no selectedAnswerId, it's likely structured
          // Also check if the question text contains HTML tags (structured questions often have rich text)
          const questionHasHtml =
            answer.questionText &&
            (answer.questionText.includes("<p>") ||
              answer.questionText.includes("<div>") ||
              answer.questionText.includes("<br>"));

          const isStructured =
            answer.questionType === "structured" ||
            answer.question?.questionType === "structured" ||
            hasStructuredAnswer ||
            (!hasOptions &&
              !hasSelectedOption &&
              !hasCorrectOption &&
              !answer.selectedAnswerId) ||
            (questionHasHtml && !hasOptions && !hasSelectedOption);

          const isCorrect =
            typeof answer.isCorrect === "boolean"
              ? answer.isCorrect
              : answer.selectedOptionId !== undefined &&
                answer.correctOptionId !== undefined
              ? answer.selectedOptionId === answer.correctOptionId
              : undefined;
          // Get question text - handle both plain text and HTML
          const rawQuestionText =
            answer.questionText ||
            answer.question?.text ||
            `Question ${index + 1}`;
          const questionText = rawQuestionText;

          // Get selected answer - prioritize structuredAnswer for structured questions
          // For structured questions, look for structuredAnswer, answerText, selectedAnswerText, or selectedAnswer (string)
          // For multiple choice, look for selectedOptionText, selectedAnswerText, or selectedAnswer (number/string)
          const selectedText = isStructured
            ? answer.structuredAnswer ||
              answer.answerText ||
              answer.selectedAnswerText ||
              (typeof answer.selectedAnswer === "string" &&
              answer.selectedAnswer.trim() !== ""
                ? answer.selectedAnswer
                : null) ||
              (answer.selectedOptionText &&
              typeof answer.selectedOptionText === "string"
                ? answer.selectedOptionText
                : null) ||
              "No answer provided"
            : answer.selectedOptionText ||
              answer.selectedAnswerText ||
              (typeof answer.selectedAnswer === "string" &&
              answer.selectedAnswer.trim() !== ""
                ? answer.selectedAnswer
                : null) ||
              (typeof answer.selectedAnswer === "number"
                ? `Option ${answer.selectedAnswer + 1}`
                : null) ||
              (answer.selectedOptionId &&
              answer.options &&
              answer.options.length > 0
                ? answer.options.find(
                    (opt) => opt.id === answer.selectedOptionId
                  )?.text || `Option ${answer.selectedOptionId}`
                : null) ||
              "No answer";
          const correctText =
            answer.correctOptionText ||
            answer.correctAnswerText ||
            (isStructured ? "Manual grading required" : "Not provided");
          const Icon = isStructured ? Award : isCorrect ? CheckCircle : XCircle;
          const iconClass = isStructured
            ? "text-blue-500"
            : isCorrect
            ? "text-emerald-500"
            : "text-rose-500";

          const marksKey = `${attempt.id}-${answer.questionId}`;
          const isEditingMarks = marksEditing[marksKey];
          const currentMarks = marksData[marksKey] || {
            awarded: answer.awardedMarks || answer.markAwarded || 0,
            max: answer.maxMarks || answer.questionMarks || 10,
          };

          return (
            <li
              key={`${attempt.id}-${answer.questionId || index}`}
              className="py-4"
            >
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 flex-shrink-0 ${iconClass}`} />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    {/* Render question text as rich text for structured questions or if it contains HTML tags */}
                    {isStructured ||
                    (questionText && questionText.includes("<")) ? (
                      <div className="font-medium text-gray-900 flex-1">
                        <div
                          className="prose prose-sm max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_strong]:font-bold"
                          dangerouslySetInnerHTML={{ __html: questionText }}
                        />
                      </div>
                    ) : (
                      <p className="font-medium text-gray-900">
                        {questionText}
                      </p>
                    )}
                    {isStructured && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                        Structured Question
                      </span>
                    )}
                  </div>

                  {isStructured ? (
                    <div className="space-y-3 mt-2">
                      <div>
                        <span className="font-semibold text-gray-700 text-sm block mb-2">
                          Participant's Answer:
                        </span>
                        {selectedText &&
                        selectedText.trim() !== "" &&
                        selectedText !== "No answer provided" ? (
                          <div
                            className="text-sm text-gray-700 bg-white p-4 rounded-md border border-gray-300 shadow-sm min-h-[100px] prose prose-sm max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6"
                            dangerouslySetInnerHTML={{ __html: selectedText }}
                          />
                        ) : (
                          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md border border-gray-200 italic">
                            No answer provided
                          </div>
                        )}
                      </div>

                      {isEditingMarks ? (
                        <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">
                              Awarded:
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={currentMarks.max}
                              value={currentMarks.awarded}
                              onChange={(e) =>
                                setMarksData({
                                  ...marksData,
                                  [marksKey]: {
                                    ...currentMarks,
                                    awarded: Math.max(
                                      0,
                                      Math.min(
                                        currentMarks.max,
                                        Number(e.target.value) || 0
                                      )
                                    ),
                                  },
                                })
                              }
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md"
                            />
                            <span className="text-sm text-gray-600">/</span>
                            <input
                              type="number"
                              min="1"
                              value={currentMarks.max}
                              onChange={(e) =>
                                setMarksData({
                                  ...marksData,
                                  [marksKey]: {
                                    ...currentMarks,
                                    max: Math.max(
                                      1,
                                      Number(e.target.value) || 10
                                    ),
                                    awarded: Math.min(
                                      currentMarks.awarded,
                                      Math.max(1, Number(e.target.value) || 10)
                                    ),
                                  },
                                })
                              }
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md"
                            />
                            <span className="text-sm text-gray-600">marks</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleSaveMarks(
                                  attempt.id,
                                  answer.questionId,
                                  currentMarks.awarded,
                                  currentMarks.max
                                )
                              }
                              className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setMarksEditing((prev) => {
                                  const newState = { ...prev };
                                  delete newState[marksKey];
                                  return newState;
                                });
                              }}
                              className="px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                          <div className="flex items-center gap-4">
                            <div className="text-sm">
                              <span className="font-semibold text-gray-700">
                                Marks:{" "}
                              </span>
                              <span
                                className={`font-medium ${
                                  answer.awardedMarks !== null &&
                                  answer.awardedMarks !== undefined
                                    ? "text-blue-600"
                                    : "text-gray-500"
                                }`}
                              >
                                {answer.awardedMarks !== null &&
                                answer.awardedMarks !== undefined
                                  ? `${answer.awardedMarks}`
                                  : "Not graded"}
                                {answer.maxMarks && ` / ${answer.maxMarks}`}
                              </span>
                            </div>
                            {answer.awardedMarks !== null &&
                              answer.awardedMarks !== undefined && (
                                <div className="text-xs text-gray-500">
                                  {Math.round(
                                    (answer.awardedMarks / answer.maxMarks) *
                                      100
                                  )}
                                  % score
                                </div>
                              )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setMarksEditing((prev) => ({
                                ...prev,
                                [marksKey]: true,
                              }));
                              setMarksData({
                                ...marksData,
                                [marksKey]: {
                                  awarded: answer.awardedMarks || 0,
                                  max: answer.maxMarks || 10,
                                },
                              });
                            }}
                            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                          >
                            {answer.awardedMarks !== null &&
                            answer.awardedMarks !== undefined
                              ? "Edit Marks"
                              : "Award Marks"}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 mt-2">
                      <div>
                        <span className="font-semibold text-gray-700 text-sm block mb-2">
                          Participant's Answer:
                        </span>
                        {selectedText && selectedText !== "No answer" ? (
                          <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded-md border border-blue-200">
                            {selectedText}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md border border-gray-200 italic">
                            No answer provided
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700 text-sm block mb-2">
                          Correct Answer:
                        </span>
                        <div className="text-sm text-gray-700 bg-green-50 p-3 rounded-md border border-green-200">
                          {correctText}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* Only show Correct/Incorrect badge for multiple choice questions, not structured */}
                {/* Safeguard: Also check for structuredAnswer to prevent showing Incorrect on structured questions */}
                {!isStructured && !hasStructuredAnswer && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isCorrect
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {isCorrect ? "Correct" : "Incorrect"}
                  </span>
                )}
                {/* Show grading status badge for structured questions */}
                {/* Also show if hasStructuredAnswer even if isStructured detection failed */}
                {(isStructured || hasStructuredAnswer) && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      answer.awardedMarks !== null &&
                      answer.awardedMarks !== undefined
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {answer.awardedMarks !== null &&
                    answer.awardedMarks !== undefined
                      ? "Graded"
                      : "Pending Review"}
                  </span>
                )}
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              role="presentation"
              style={{ cursor: "default", pointerEvents: "auto" }}
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
                  onClick={async () => {
                    try {
                      // First recalculate all attempts based on current pass mark and correct answers
                      await recalculateAttempts(assessmentId).unwrap();
                      // Then refetch the updated data
                      await refetch();
                    } catch (error) {
                      console.error("Error recalculating attempts:", error);
                      // Still try to refetch even if recalculation fails
                      await refetch();
                    }
                  }}
                  disabled={isRecalculating || isFetching}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRecalculating ? "Recalculating..." : "Refresh"}
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
                  : attempt.totalMarks && attempt.totalMarks > 0
                  ? Math.round((attempt.score * 100) / attempt.totalMarks)
                  : attempt.totalQuestions
                  ? Math.round((attempt.score * 100) / attempt.totalQuestions)
                  : 0;
                const passed = percent >= 70; // Match report pass/fail threshold (70%)
                const badgeClass = passed
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700";
                const badgeText = passed ? "Passed" : "Failed";
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
                          {Math.round(attempt.score * 100) / 100}/
                          {attempt.totalMarks
                            ? Math.round(attempt.totalMarks * 100) / 100
                            : attempt.totalQuestions}
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
                        {/* Assessment Report */}
                        {renderAssessmentReport(attempt)}

                        <h4 className="text-sm font-semibold text-gray-700 mb-3 mt-6">
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
                  Showing the best attempt for each participant, ranked by
                  performance.
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
                        <tr
                          key={user.participantId}
                          className={index < 3 ? "bg-yellow-50" : ""}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {index === 0 && (
                                <Award className="h-5 w-5 text-yellow-500 mr-2" />
                              )}
                              {index === 1 && (
                                <Award className="h-5 w-5 text-gray-400 mr-2" />
                              )}
                              {index === 2 && (
                                <Award className="h-5 w-5 text-amber-600 mr-2" />
                              )}
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
                            {Math.round(user.score * 100) / 100}/
                            {user.totalMarks
                              ? Math.round(user.totalMarks * 100) / 100
                              : user.totalQuestions}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.percentage >= 80
                                  ? "bg-green-100 text-green-800"
                                  : user.percentage >= 60
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.percentage}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.passed
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
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
