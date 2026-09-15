"use client";

import { motion } from "framer-motion";
import {
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    Clock3,
    Download,
    FileText,
    Loader2,
    Mail,
    Save,
    Target,
    Trophy,
    XCircle,
} from "lucide-react";
import {
    Bar,
    BarChart,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useMemo, useState } from "react";
import jsPDF from "jspdf";

import { Button } from "@/components/ui/button";
import { useAssessmentResults } from "@/hooks/queries/employer/useAssessmentResults";

interface EmployerCandidateResultProps {
    assessmentId: string;
    employeeId: string;
}

interface CandidateQuestion {
    questionId: string;
    order: number;
    question: string;
    type: string;
    points: number;
    required?: boolean;
    selectionType?: "single" | "multiple" | null;

    options?: Array<{
        optionId: string;
        text: string;
        isCorrect?: boolean;
    }>;

    correctOptionIds?: string[];

    language?: string | null;
    starterCode?: string | null;
    inputDescription?: string | null;
    outputDescription?: string | null;
    constraints?: string | null;
    minLength?: number | null;
    maxLength?: number | null;
    answerPlaceholder?: string | null;
    autoEvaluate?: boolean;
    explanation?: string | null;

    answer?: {
        answer?: string | null;
        selectedOptions?: string[];
        answeredAt?: string | Date | null;
        isCorrect?: boolean | null;
    };

    grading?: {
        awardedPoints?: number;
        gradingType?: string;
        gradingNote?: string | null;
        manuallyGraded?: boolean;
        gradedAt?: string | Date | null;
    };
}

interface GradeDraft {
    awardedPoints: string;
    gradingNote: string;
}

export default function EmployerCandidateResult({
    assessmentId,
    employeeId,
}: EmployerCandidateResultProps) {
    const {
        candidateResult,
        isCandidateResultLoading,
        candidateResultError,
        gradeCandidate,
        isGrading,
        shortlistCandidate,
        isShortlisting,
    } = useAssessmentResults({
        assessmentId,
        employeeId,
    });

    const [gradeDrafts, setGradeDrafts] = useState<Record<string, GradeDraft>>(
        {},
    );

    const [isDownloading, setIsDownloading] = useState(false);

    const attempt = candidateResult?.attempt;
    const employee = candidateResult?.employee;
    const assessment = candidateResult?.assessment;
    const assignment = candidateResult?.assignment;

    /*
     * Backend returns candidateResult.questions[].
     */
    const questions = useMemo<CandidateQuestion[]>(
        () => candidateResult?.questions ?? [],
        [candidateResult?.questions],
    );

    /*
     * This is persisted backend state.
     *
     * IMPORTANT:
     * `shortlisted` means the candidate has been shortlisted.
     *
     * `shortlistEmailSentAt` means the shortlist notification
     * was actually sent and persisted.
     */
    const shortlisted = assignment?.shortlisted === true;

    const shortlistEmailSent = Boolean(assignment?.shortlistEmailSentAt);

    console.log(shortlisted, shortlistEmailSent);

    const statistics = useMemo(() => {
        const total = questions.length;

        const answered = questions.filter((item) => {
            const textAnswer =
                item.answer?.answer !== undefined &&
                item.answer?.answer !== null &&
                item.answer?.answer !== "";

            const selectedOptions =
                Array.isArray(item.answer?.selectedOptions) &&
                item.answer.selectedOptions.length > 0;

            return textAnswer || selectedOptions;
        }).length;

        const unanswered = Math.max(total - answered, 0);

        const mcqQuestions = questions.filter((item) => item.type === "mcq");

        const correct = mcqQuestions.filter(
            (item) => item.answer?.isCorrect === true,
        ).length;

        const incorrect = mcqQuestions.filter(
            (item) => item.answer?.isCorrect === false,
        ).length;

        const unansweredMcq = Math.max(
            mcqQuestions.length - correct - incorrect,
            0,
        );

        const totalPoints = questions.reduce(
            (sum, item) => sum + Number(item.points ?? 0),
            0,
        );

        const awardedPoints = questions.reduce(
            (sum, item) => sum + Number(item.grading?.awardedPoints ?? 0),
            0,
        );

        const gradedQuestions = questions.filter(
            (item) =>
                item.grading?.manuallyGraded === true ||
                item.grading?.gradingType === "automatic",
        ).length;

        const ungradedQuestions = Math.max(total - gradedQuestions, 0);

        const averageQuestionScore =
            total > 0
                ? questions.reduce((sum, question) => {
                      const points = Number(question.points ?? 0);

                      if (points <= 0) {
                          return sum;
                      }

                      const awarded = Number(
                          question.grading?.awardedPoints ?? 0,
                      );

                      return sum + (awarded / points) * 100;
                  }, 0) / total
                : 0;

        return {
            total,
            answered,
            unanswered,
            correct,
            incorrect,
            unansweredMcq,
            totalPoints,
            awardedPoints,
            gradedQuestions,
            ungradedQuestions,
            mcqTotal: mcqQuestions.length,
            averageQuestionScore,
        };
    }, [questions]);

    /*
     * Answer completion chart.
     */
    const answerChartData = useMemo(
        () => [
            {
                name: "Answered",
                value: statistics.answered,
            },
            {
                name: "Unanswered",
                value: statistics.unanswered,
            },
        ],
        [statistics],
    );

    /*
     * MCQ correctness chart.
     */
    const correctnessChartData = useMemo(
        () => [
            {
                name: "Correct",
                value: statistics.correct,
            },
            {
                name: "Incorrect",
                value: statistics.incorrect,
            },
            {
                name: "Not answered",
                value: statistics.unansweredMcq,
            },
        ],
        [statistics],
    );

    /*
     * Question performance.
     */
    const performanceChartData = useMemo(
        () =>
            questions.map((item, index) => {
                const awarded = Number(item.grading?.awardedPoints ?? 0);

                const maximum = Number(item.points ?? 0);

                return {
                    name: `Q${index + 1}`,
                    awarded,
                    maximum,
                    percentage:
                        maximum > 0 ? Math.round((awarded / maximum) * 100) : 0,
                };
            }),
        [questions],
    );

    if (isCandidateResultLoading) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <Loader2 className="size-7 animate-spin text-primary" />
            </div>
        );
    }

    if (candidateResultError) {
        return (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
                <AlertTriangle className="mx-auto size-8 text-destructive" />

                <h2 className="mt-3 font-semibold">
                    Unable to load candidate result
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    {candidateResultError.message}
                </p>
            </div>
        );
    }

    if (!candidateResult) {
        return (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
                <FileText className="mx-auto size-8 text-muted-foreground" />

                <h2 className="mt-3 font-semibold">
                    Candidate result not found
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    No assessment result is available for this candidate.
                </p>
            </div>
        );
    }

    const percentage = Number(attempt?.percentage ?? 0);

    const score = Number(attempt?.score ?? statistics.awardedPoints);

    const maxPoints = Number(assessment?.totalPoints ?? statistics.totalPoints);

    const handleShortlist = async () => {
        if (shortlisted || shortlistEmailSent) {
            return;
        }

        await shortlistCandidate({
            assessmentId,
            employeeId,
        });
    };

    const getDraft = (question: CandidateQuestion): GradeDraft => {
        const existing = gradeDrafts[question.questionId];

        if (existing) {
            return existing;
        }

        return {
            awardedPoints: String(question.grading?.awardedPoints ?? 0),
            gradingNote: question.grading?.gradingNote ?? "",
        };
    };

    const updateDraft = (
        questionId: string,
        field: keyof GradeDraft,
        value: string,
    ) => {
        setGradeDrafts((current) => ({
            ...current,
            [questionId]: {
                ...current[questionId],
                [field]: value,
            },
        }));
    };

    const handleGrade = async (question: CandidateQuestion) => {
        const draft = getDraft(question);

        const maxQuestionPoints = Number(question.points ?? 0);

        const rawPoints = Number(draft.awardedPoints || 0);

        const awardedPoints = Math.min(
            Math.max(Number.isFinite(rawPoints) ? rawPoints : 0, 0),
            maxQuestionPoints,
        );

        await gradeCandidate({
            assessmentId,
            employeeId,
            grades: [
                {
                    questionId: question.questionId,
                    awardedPoints,
                    gradingNote: draft.gradingNote.trim(),
                },
            ],
        });
    };

    const handleDownloadReport = async () => {
        if (isDownloading) {
            return;
        }

        try {
            setIsDownloading(true);

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const margin = 18;
            const contentWidth = pageWidth - margin * 2;

            let y = 20;

            /*
             * =========================================================
             * COLORS
             * =========================================================
             *
             * No secondary color is used as a large PDF background.
             *
             * Primary:
             * - branding
             * - important metrics
             * - awarded/correct values
             *
             * Neutral:
             * - tracks
             * - maximum values
             * - secondary chart information
             */

            const primary = getThemeColor("--primary");
            const muted = getThemeColor("--muted-foreground");

            const darkText: [number, number, number] = [40, 40, 40];

            const neutral: [number, number, number] = [205, 209, 215];

            const lightBorder: [number, number, number] = [225, 228, 232];

            const lightSurface: [number, number, number] = [249, 250, 251];

            const white: [number, number, number] = [255, 255, 255];

            /*
             * =========================================================
             * PAGE HELPERS
             * =========================================================
             */

            const addPageIfNeeded = (requiredHeight: number) => {
                if (y + requiredHeight > pageHeight - 18) {
                    pdf.addPage();
                    y = 20;
                }
            };

            const addWrappedText = (
                text: string,
                options?: {
                    size?: number;
                    bold?: boolean;
                    color?: [number, number, number];
                    lineHeight?: number;
                },
            ) => {
                const size = options?.size ?? 10;

                const lineHeight = options?.lineHeight ?? 5;

                pdf.setFontSize(size);

                pdf.setFont("helvetica", options?.bold ? "bold" : "normal");

                pdf.setTextColor(...(options?.color ?? darkText));

                const lines = pdf.splitTextToSize(text, contentWidth);

                addPageIfNeeded(lines.length * lineHeight + 2);

                pdf.text(lines, margin, y);

                y += lines.length * lineHeight + 2;
            };

            const addSectionTitle = (title: string, description?: string) => {
                addPageIfNeeded(description ? 18 : 10);

                pdf.setFont("helvetica", "bold");

                pdf.setFontSize(13);

                pdf.setTextColor(...primary);

                pdf.text(title, margin, y);

                y += 6;

                if (description) {
                    pdf.setFont("helvetica", "normal");

                    pdf.setFontSize(8.5);

                    pdf.setTextColor(...muted);

                    const lines = pdf.splitTextToSize(
                        description,
                        contentWidth,
                    );

                    pdf.text(lines, margin, y);

                    y += lines.length * 4 + 3;
                }
            };

            /*
             * =========================================================
             * HEADER
             * =========================================================
             */

            pdf.setFillColor(...primary);

            pdf.rect(0, 0, pageWidth, 38, "F");

            pdf.setTextColor(...white);

            pdf.setFontSize(20);

            pdf.setFont("helvetica", "bold");

            pdf.text("SkillKwiz", margin, 16);

            pdf.setFontSize(10);

            pdf.setFont("helvetica", "normal");

            pdf.text("Candidate Assessment Report", margin, 24);

            y = 50;

            /*
             * =========================================================
             * CANDIDATE INFORMATION
             * =========================================================
             */

            addWrappedText(employee?.fullName ?? "Unknown Candidate", {
                size: 18,
                bold: true,
                color: primary,
                lineHeight: 7,
            });

            addWrappedText(employee?.email ?? "—", {
                size: 10,
                color: muted,
            });

            if (employee?.department) {
                addWrappedText(`Department: ${employee.department}`, {
                    size: 9,
                    color: muted,
                });
            }

            if (employee?.designation) {
                addWrappedText(`Designation: ${employee.designation}`, {
                    size: 9,
                    color: muted,
                });
            }

            y += 4;

            /*
             * =========================================================
             * ASSESSMENT
             * =========================================================
             */

            addWrappedText(assessment?.title ?? "Assessment", {
                size: 13,
                bold: true,
            });

            /*
             * =========================================================
             * TOP SUMMARY
             * =========================================================
             */

            addPageIfNeeded(45);

            /*
             * Outline-only summary container.
             */

            pdf.setDrawColor(...lightBorder);

            pdf.setLineWidth(0.4);

            pdf.roundedRect(margin, y, contentWidth, 40, 3, 3, "S");

            const summaryY = y + 9;

            /*
             * Labels
             */

            pdf.setFont("helvetica", "normal");

            pdf.setFontSize(7.5);

            pdf.setTextColor(...muted);

            pdf.text("SCORE", margin + 7, summaryY);

            pdf.text("PERCENTAGE", margin + 52, summaryY);

            pdf.text("ANSWERED", margin + 102, summaryY);

            pdf.text("TAB CHANGES", margin + 147, summaryY);

            /*
             * Values
             */

            pdf.setFont("helvetica", "bold");

            pdf.setFontSize(13);

            pdf.setTextColor(...primary);

            pdf.text(
                `${formatNumber(score)}/${formatNumber(maxPoints)}`,
                margin + 7,
                summaryY + 10,
            );

            pdf.text(
                `${formatNumber(percentage)}%`,
                margin + 52,
                summaryY + 10,
            );

            pdf.text(
                `${statistics.answered}/${statistics.total}`,
                margin + 102,
                summaryY + 10,
            );

            pdf.text(
                String(attempt?.tabChangeCount ?? 0),
                margin + 147,
                summaryY + 10,
            );

            /*
             * Small bottom divider.
             */

            pdf.setDrawColor(...lightBorder);

            pdf.line(margin + 7, y + 25, pageWidth - margin - 7, y + 25);

            /*
             * Status
             */

            pdf.setFontSize(7);

            pdf.setFont("helvetica", "normal");

            pdf.setTextColor(...muted);

            pdf.text(
                `Status: ${attempt?.status ?? assignment?.status ?? "—"}`,
                margin + 7,
                y + 33,
            );

            pdf.text(
                `Submission: ${attempt?.submissionType ?? "—"}`,
                margin + 75,
                y + 33,
            );

            pdf.text(
                `Submitted: ${formatDate(attempt?.submittedAt)}`,
                margin + 145,
                y + 33,
            );

            y += 49;

            /*
             * =========================================================
             * ASSESSMENT DETAILS
             * =========================================================
             */

            addSectionTitle("Assessment Details");

            addWrappedText(
                `Status: ${attempt?.status ?? assignment?.status ?? "—"}`,
                {
                    size: 9,
                },
            );

            addWrappedText(`Submission: ${attempt?.submissionType ?? "—"}`, {
                size: 9,
            });

            addWrappedText(`Started: ${formatDate(attempt?.startedAt)}`, {
                size: 9,
            });

            addWrappedText(`Submitted: ${formatDate(attempt?.submittedAt)}`, {
                size: 9,
            });

            y += 5;

            /*
             * =========================================================
             * PERFORMANCE OVERVIEW
             * =========================================================
             */

            addSectionTitle(
                "Performance Overview",
                "Visual summary of completion, MCQ accuracy, and overall assessment performance.",
            );

            /*
             * =========================================================
             * DONUT CHART HELPER
             * =========================================================
             */

            const drawDonutChart = ({
                centerX,
                centerY,
                radius,
                thickness,
                values,
                colors,
                total,
                centerLabel,
                centerSubLabel,
            }: {
                centerX: number;
                centerY: number;
                radius: number;
                thickness: number;
                values: number[];
                colors: Array<[number, number, number]>;
                total: number;
                centerLabel: string;
                centerSubLabel: string;
            }) => {
                /*
                 * Empty chart.
                 */

                if (total <= 0) {
                    pdf.setDrawColor(...neutral);

                    pdf.setLineWidth(thickness);

                    pdf.circle(centerX, centerY, radius, "S");

                    pdf.setFont("helvetica", "normal");

                    pdf.setFontSize(8);

                    pdf.setTextColor(...muted);

                    pdf.text("No data", centerX, centerY + 1, {
                        align: "center",
                    });

                    return;
                }

                let currentAngle = -Math.PI / 2;

                values.forEach((value, index) => {
                    if (value <= 0) {
                        return;
                    }

                    const angle = (value / total) * Math.PI * 2;

                    const steps = Math.max(8, Math.ceil(Math.abs(angle) * 30));

                    let previousX = centerX + radius * Math.cos(currentAngle);

                    let previousY = centerY + radius * Math.sin(currentAngle);

                    pdf.setDrawColor(...colors[index]);

                    pdf.setLineWidth(thickness);

                    for (let i = 1; i <= steps; i++) {
                        const theta = currentAngle + (angle * i) / steps;

                        const currentX = centerX + radius * Math.cos(theta);

                        const currentY = centerY + radius * Math.sin(theta);

                        pdf.line(previousX, previousY, currentX, currentY);

                        previousX = currentX;

                        previousY = currentY;
                    }

                    currentAngle += angle;
                });

                /*
                 * Center text.
                 */

                pdf.setFont("helvetica", "bold");

                pdf.setFontSize(15);

                pdf.setTextColor(...primary);

                pdf.text(centerLabel, centerX, centerY + 1, {
                    align: "center",
                });

                pdf.setFont("helvetica", "normal");

                pdf.setFontSize(7);

                pdf.setTextColor(...muted);

                pdf.text(centerSubLabel, centerX, centerY + 7, {
                    align: "center",
                });
            };

            /*
             * =========================================================
             * TWO DONUT CHARTS
             * =========================================================
             */

            addPageIfNeeded(82);

            const chartTop = y;

            /*
             * LEFT CHART
             * Answer completion
             */

            const leftChartX = margin + 43;

            drawDonutChart({
                centerX: leftChartX,
                centerY: chartTop + 35,
                radius: 23,
                thickness: 7,
                values: [statistics.answered, statistics.unanswered],
                colors: [primary, neutral],
                total: statistics.total,
                centerLabel:
                    statistics.total > 0
                        ? `${Math.round(
                              (statistics.answered / statistics.total) * 100,
                          )}%`
                        : "0%",
                centerSubLabel: "completed",
            });

            pdf.setFont("helvetica", "bold");

            pdf.setFontSize(9);

            pdf.setTextColor(...darkText);

            pdf.text("Answer Completion", margin, chartTop + 8);

            pdf.setFont("helvetica", "normal");

            pdf.setFontSize(7.5);

            pdf.setTextColor(...muted);

            pdf.text("Answered vs unanswered", margin, chartTop + 13);

            /*
             * Left legend
             */

            let leftLegendY = chartTop + 58;

            pdf.setFillColor(...primary);

            pdf.circle(margin + 2, leftLegendY - 1, 1.3, "F");

            pdf.setTextColor(...darkText);

            pdf.text(
                `Answered: ${statistics.answered}`,
                margin + 6,
                leftLegendY + 1,
            );

            leftLegendY += 6;

            pdf.setFillColor(...neutral);

            pdf.circle(margin + 2, leftLegendY - 1, 1.3, "F");

            pdf.text(
                `Unanswered: ${statistics.unanswered}`,
                margin + 6,
                leftLegendY + 1,
            );

            /*
             * RIGHT CHART
             * MCQ performance
             */

            const rightChartX = pageWidth - margin - 43;

            drawDonutChart({
                centerX: rightChartX,
                centerY: chartTop + 35,
                radius: 23,
                thickness: 7,
                values: [
                    statistics.correct,
                    statistics.incorrect,
                    statistics.unansweredMcq,
                ],
                colors: [primary, neutral, [180, 184, 190]],
                total: statistics.mcqTotal,
                centerLabel:
                    statistics.mcqTotal > 0
                        ? `${statistics.correct}/${statistics.mcqTotal}`
                        : "0",
                centerSubLabel: "correct",
            });

            pdf.setFont("helvetica", "bold");

            pdf.setFontSize(9);

            pdf.setTextColor(...darkText);

            pdf.text("MCQ Performance", pageWidth - margin - 88, chartTop + 8);

            pdf.setFont("helvetica", "normal");

            pdf.setFontSize(7.5);

            pdf.setTextColor(...muted);

            pdf.text(
                "Correctness breakdown",
                pageWidth - margin - 88,
                chartTop + 13,
            );

            /*
             * Right legend
             */

            let rightLegendY = chartTop + 52;

            const mcqLegend = [
                {
                    label: `Correct: ${statistics.correct}`,
                    color: primary,
                },
                {
                    label: `Incorrect: ${statistics.incorrect}`,
                    color: neutral,
                },
                {
                    label: `Not answered: ${statistics.unansweredMcq}`,
                    color: [180, 184, 190] as [number, number, number],
                },
            ];

            mcqLegend.forEach((item) => {
                pdf.setFillColor(...item.color);

                pdf.circle(pageWidth - margin - 88, rightLegendY - 1, 1.3, "F");

                pdf.setTextColor(...darkText);

                pdf.text(item.label, pageWidth - margin - 82, rightLegendY + 1);

                rightLegendY += 6;
            });

            y = chartTop + 78;

            /*
             * =========================================================
             * OVERALL SCORE
             * =========================================================
             */

            addPageIfNeeded(35);

            pdf.setFont("helvetica", "bold");

            pdf.setFontSize(10);

            pdf.setTextColor(...darkText);

            pdf.text("Overall Score", margin, y);

            y += 6;

            /*
             * Score track
             */

            const scoreBarWidth = contentWidth;

            const scoreBarHeight = 7;

            pdf.setFillColor(235, 237, 240);

            pdf.roundedRect(
                margin,
                y,
                scoreBarWidth,
                scoreBarHeight,
                2,
                2,
                "F",
            );

            const scoreRatio =
                maxPoints > 0 ? Math.min(Math.max(score / maxPoints, 0), 1) : 0;

            if (scoreRatio > 0) {
                pdf.setFillColor(...primary);

                pdf.roundedRect(
                    margin,
                    y,
                    scoreBarWidth * scoreRatio,
                    scoreBarHeight,
                    2,
                    2,
                    "F",
                );
            }

            pdf.setFontSize(8);

            pdf.setFont("helvetica", "bold");

            pdf.setTextColor(...primary);

            pdf.text(
                `${formatNumber(score)} / ${formatNumber(maxPoints)} points`,
                pageWidth - margin,
                y + 5,
                {
                    align: "right",
                },
            );

            y += 16;

            /*
             * =========================================================
             * QUESTION PERFORMANCE
             * =========================================================
             */

            if (questions.length > 0) {
                addPageIfNeeded(105);

                addSectionTitle(
                    "Question Performance",
                    "Awarded points compared with the maximum points available for each question.",
                );

                const chartX = margin;
                const chartY = y;

                const chartWidth = contentWidth;

                const chartHeight = 65;

                /*
                 * Chart outline
                 */

                pdf.setDrawColor(...lightBorder);

                pdf.setLineWidth(0.35);

                pdf.roundedRect(
                    chartX,
                    chartY,
                    chartWidth,
                    chartHeight,
                    3,
                    3,
                    "S",
                );

                /*
                 * Graph dimensions
                 */

                const leftPadding = 13;
                const rightPadding = 8;
                const topPadding = 8;
                const bottomPadding = 15;

                const graphX = chartX + leftPadding;

                const graphY = chartY + topPadding;

                const graphWidth = chartWidth - leftPadding - rightPadding;

                const graphHeight = chartHeight - topPadding - bottomPadding;

                const maximumValue = Math.max(
                    ...questions.map((question) =>
                        Number(question.points ?? 0),
                    ),
                    1,
                );

                /*
                 * Grid lines
                 */

                const gridSteps = 4;

                for (let step = 0; step <= gridSteps; step++) {
                    const ratio = step / gridSteps;

                    const lineY = graphY + graphHeight - graphHeight * ratio;

                    pdf.setDrawColor(...lightBorder);

                    pdf.setLineWidth(0.2);

                    pdf.line(graphX, lineY, graphX + graphWidth, lineY);

                    pdf.setFont("helvetica", "normal");

                    pdf.setFontSize(6);

                    pdf.setTextColor(...muted);

                    pdf.text(
                        formatNumber(maximumValue * ratio),
                        graphX - 3,
                        lineY + 1.5,
                        {
                            align: "right",
                        },
                    );
                }

                /*
                 * Bars
                 */

                const questionCount = questions.length;

                const groupWidth = graphWidth / questionCount;

                /*
                 * Prevent bars becoming
                 * ridiculously wide when
                 * there are only a few questions.
                 */

                const barWidth = Math.min(5, Math.max(1.8, groupWidth * 0.22));

                questions.forEach((question, index) => {
                    const awarded = Number(
                        question.grading?.awardedPoints ?? 0,
                    );

                    const maximum = Number(question.points ?? 0);

                    const center = graphX + groupWidth * index + groupWidth / 2;

                    /*
                     * Maximum points
                     */

                    const maxHeight =
                        maximumValue > 0
                            ? (maximum / maximumValue) * graphHeight
                            : 0;

                    const maxBarY = graphY + graphHeight - maxHeight;

                    pdf.setFillColor(...neutral);

                    pdf.roundedRect(
                        center - barWidth - 1,
                        maxBarY,
                        barWidth,
                        maxHeight,
                        1,
                        1,
                        "F",
                    );

                    /*
                     * Awarded points
                     */

                    const awardedHeight =
                        maximumValue > 0
                            ? (awarded / maximumValue) * graphHeight
                            : 0;

                    const awardedBarY = graphY + graphHeight - awardedHeight;

                    pdf.setFillColor(...primary);

                    pdf.roundedRect(
                        center + 1,
                        awardedBarY,
                        barWidth,
                        awardedHeight,
                        1,
                        1,
                        "F",
                    );

                    /*
                     * Question label
                     */

                    pdf.setFont("helvetica", "bold");

                    pdf.setFontSize(6);

                    pdf.setTextColor(...muted);

                    pdf.text(
                        `Q${index + 1}`,
                        center,
                        chartY + chartHeight - 5,
                        {
                            align: "center",
                        },
                    );
                });

                /*
                 * Chart legend
                 */

                const legendY = chartY + chartHeight + 7;

                pdf.setFillColor(...primary);

                pdf.rect(margin, legendY - 2.5, 3, 3, "F");

                pdf.setFont("helvetica", "normal");

                pdf.setFontSize(7);

                pdf.setTextColor(...darkText);

                pdf.text("Awarded points", margin + 5, legendY);

                pdf.setFillColor(...neutral);

                pdf.rect(margin + 45, legendY - 2.5, 3, 3, "F");

                pdf.text("Maximum points", margin + 50, legendY);

                y = legendY + 9;
            }

            /*
             * =========================================================
             * PERFORMANCE SUMMARY
             * =========================================================
             */

            addPageIfNeeded(45);

            addSectionTitle("Performance Summary");

            /*
             * Clean outline card.
             */

            pdf.setDrawColor(...lightBorder);

            pdf.setLineWidth(0.35);

            pdf.roundedRect(margin, y, contentWidth, 30, 3, 3, "S");

            const summaryBoxY = y;

            /*
             * Score
             */

            pdf.setFont("helvetica", "normal");

            pdf.setFontSize(7);

            pdf.setTextColor(...muted);

            pdf.text("SCORE", margin + 7, summaryBoxY + 8);

            pdf.setFont("helvetica", "bold");

            pdf.setFontSize(12);

            pdf.setTextColor(...primary);

            pdf.text(
                `${formatNumber(score)}/${formatNumber(maxPoints)}`,
                margin + 7,
                summaryBoxY + 18,
            );

            /*
             * Percentage
             */

            pdf.setFont("helvetica", "normal");

            pdf.setFontSize(7);

            pdf.setTextColor(...muted);

            pdf.text("PERCENTAGE", margin + 55, summaryBoxY + 8);

            pdf.setFont("helvetica", "bold");

            pdf.setFontSize(12);

            pdf.setTextColor(...primary);

            pdf.text(
                `${formatNumber(percentage)}%`,
                margin + 55,
                summaryBoxY + 18,
            );

            /*
             * Answered
             */

            pdf.setFont("helvetica", "normal");

            pdf.setFontSize(7);

            pdf.setTextColor(...muted);

            pdf.text("ANSWERED", margin + 105, summaryBoxY + 8);

            pdf.setFont("helvetica", "bold");

            pdf.setFontSize(12);

            pdf.setTextColor(...primary);

            pdf.text(
                `${statistics.answered}/${statistics.total}`,
                margin + 105,
                summaryBoxY + 18,
            );

            /*
             * Graded
             */

            pdf.setFont("helvetica", "normal");

            pdf.setFontSize(7);

            pdf.setTextColor(...muted);

            pdf.text("GRADED", margin + 150, summaryBoxY + 8);

            pdf.setFont("helvetica", "bold");

            pdf.setFontSize(12);

            pdf.setTextColor(...primary);

            pdf.text(
                `${statistics.gradedQuestions}/${statistics.total}`,
                margin + 150,
                summaryBoxY + 18,
            );

            y += 40;

            /*
             * =========================================================
             * QUESTION REVIEW
             * =========================================================
             */

            addSectionTitle(
                "Question Review",
                "Detailed review of candidate responses, correct answers, scores, and grading notes.",
            );

            questions.forEach((question, index) => {
                addPageIfNeeded(35);

                /*
                 * Question title
                 */

                addWrappedText(`Q${index + 1}. ${question.question}`, {
                    size: 10,
                    bold: true,
                });

                /*
                 * Question metadata
                 */

                addWrappedText(
                    `Type: ${question.type} • Score: ${formatNumber(
                        question.grading?.awardedPoints ?? 0,
                    )}/${formatNumber(question.points ?? 0)}`,
                    {
                        size: 8,
                        color: muted,
                    },
                );

                /*
                 * Candidate answer
                 */

                const selectedOptions = question.answer?.selectedOptions ?? [];

                if (selectedOptions.length > 0) {
                    const optionMap = new Map(
                        (question.options ?? []).map((option) => [
                            option.optionId,
                            option.text,
                        ]),
                    );

                    const selectedText = selectedOptions
                        .map((optionId) => optionMap.get(optionId) ?? optionId)
                        .join(", ");

                    addWrappedText(`Candidate Answer: ${selectedText}`, {
                        size: 9,
                    });
                } else {
                    addWrappedText(
                        `Candidate Answer: ${
                            question.answer?.answer || "No answer submitted."
                        }`,
                        {
                            size: 9,
                        },
                    );
                }

                /*
                 * Correct answer
                 */

                if (
                    question.type === "mcq" &&
                    question.correctOptionIds?.length
                ) {
                    const optionMap = new Map(
                        (question.options ?? []).map((option) => [
                            option.optionId,
                            option.text,
                        ]),
                    );

                    const correctText = question.correctOptionIds
                        .map((optionId) => optionMap.get(optionId) ?? optionId)
                        .join(", ");

                    addWrappedText(`Correct Answer: ${correctText}`, {
                        size: 9,
                        color: primary,
                    });
                }

                /*
                 * Grading note
                 */

                if (question.grading?.gradingNote) {
                    addWrappedText(
                        `Grading Note: ${question.grading.gradingNote}`,
                        {
                            size: 9,
                        },
                    );
                }

                /*
                 * Question divider
                 */

                y += 3;

                pdf.setDrawColor(...lightBorder);

                pdf.setLineWidth(0.25);

                pdf.line(margin, y, pageWidth - margin, y);

                y += 5;
            });

            /*
             * =========================================================
             * FOOTER
             * =========================================================
             */

            const totalPages = pdf.getNumberOfPages();

            for (let page = 1; page <= totalPages; page++) {
                pdf.setPage(page);

                pdf.setFont("helvetica", "normal");

                pdf.setFontSize(7);

                pdf.setTextColor(...muted);

                pdf.text(
                    `SkillKwiz • Candidate Assessment Report • ${page}/${totalPages}`,
                    margin,
                    pageHeight - 8,
                );

                /*
                 * Small footer line
                 */

                pdf.setDrawColor(...lightBorder);

                pdf.setLineWidth(0.25);

                pdf.line(
                    margin,
                    pageHeight - 12,
                    pageWidth - margin,
                    pageHeight - 12,
                );
            }

            /*
             * =========================================================
             * SAVE PDF
             * =========================================================
             */

            pdf.save(
                `${sanitizeFileName(
                    employee?.fullName ?? "candidate",
                )}-assessment-report.pdf`,
            );
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Candidate header */}
            <motion.div
                initial={{
                    opacity: 0,
                    y: 10,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                className="rounded-2xl border border-border bg-background p-5"
            >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                            {getInitials(employee?.fullName)}
                        </div>

                        <div>
                            <h1 className="text-xl font-semibold">
                                {employee?.fullName ?? "Unknown candidate"}
                            </h1>

                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                {employee?.email && (
                                    <span className="inline-flex items-center gap-1">
                                        <Mail className="size-3.5" />
                                        {employee.email}
                                    </span>
                                )}

                                {employee?.department && (
                                    <span>{employee.department}</span>
                                )}

                                {employee?.designation && (
                                    <span>{employee.designation}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handleDownloadReport}
                            disabled={isDownloading}
                        >
                            {isDownloading ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Preparing PDF...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 size-4" />
                                    Download Report
                                </>
                            )}
                        </Button>

                        {shortlistEmailSent ? (
                            <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                                <Mail className="size-4" />
                                Shortlist Email Sent
                            </div>
                        ) : shortlisted ? (
                            <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                                <CheckCircle2 className="size-4" />
                                Shortlisted
                            </div>
                        ) : (
                            <Button
                                onClick={handleShortlist}
                                disabled={isShortlisting}
                            >
                                {isShortlisting ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Trophy className="mr-2 size-4" />
                                        Shortlist
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Assessment heading */}
            <div>
                <p className="text-sm text-muted-foreground">Assessment</p>

                <h2 className="mt-1 text-lg font-semibold">
                    {assessment?.title ?? "Assessment"}
                </h2>

                {assessment?.description && (
                    <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                        {assessment.description}
                    </p>
                )}

                {Array.isArray(assessment?.skills) &&
                    assessment.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {assessment.skills.map((skill: string) => (
                                <span
                                    key={skill}
                                    className="rounded-full bg-secondary text-white px-3 py-1 text-xs font-medium"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
            </div>

            {/* Score cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={<Trophy className="size-5" />}
                    label="Score"
                    value={`${formatNumber(score)}/${formatNumber(maxPoints)}`}
                />

                <StatCard
                    icon={<Target className="size-5" />}
                    label="Percentage"
                    value={`${formatNumber(percentage)}%`}
                />

                <StatCard
                    icon={<CheckCircle2 className="size-5" />}
                    label="Answered"
                    value={`${statistics.answered}/${statistics.total}`}
                />

                <StatCard
                    icon={<Clock3 className="size-5" />}
                    label="Tab changes"
                    value={String(attempt?.tabChangeCount ?? 0)}
                />
            </div>

            {/* Stylish charts */}
            <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard
                    title="Answer completion"
                    description="How much of the assessment the candidate completed."
                >
                    {statistics.total === 0 ? (
                        <EmptyChartMessage />
                    ) : (
                        <div className="relative h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={answerChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={72}
                                        outerRadius={105}
                                        paddingAngle={4}
                                        strokeWidth={0}
                                    >
                                        <Cell fill="hsl(var(--primary))" />

                                        <Cell fill="hsl(var(--secondary))" />
                                    </Pie>

                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "1px solid hsl(var(--border))",
                                            background:
                                                "hsl(var(--background))",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold">
                                    {Math.round(
                                        (statistics.answered /
                                            Math.max(statistics.total, 1)) *
                                            100,
                                    )}
                                    %
                                </span>

                                <span className="text-xs text-muted-foreground">
                                    completed
                                </span>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-6">
                                <ChartLegend
                                    label="Answered"
                                    value={statistics.answered}
                                    primary
                                />

                                <ChartLegend
                                    label="Unanswered"
                                    value={statistics.unanswered}
                                />
                            </div>
                        </div>
                    )}
                </ChartCard>

                <ChartCard
                    title="MCQ performance"
                    description="Automatic correctness across multiple-choice questions."
                >
                    {statistics.mcqTotal === 0 ? (
                        <EmptyChartMessage text="No MCQ questions are included in this assessment." />
                    ) : (
                        <div className="relative h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={correctnessChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={72}
                                        outerRadius={105}
                                        paddingAngle={4}
                                        strokeWidth={0}
                                    >
                                        <Cell fill="hsl(var(--primary))" />

                                        <Cell fill="hsl(var(--secondary))" />

                                        <Cell fill="hsl(var(--muted))" />
                                    </Pie>

                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "1px solid hsl(var(--border))",
                                            background:
                                                "hsl(var(--background))",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold">
                                    {statistics.correct}/{statistics.mcqTotal}
                                </span>

                                <span className="text-xs text-muted-foreground">
                                    correct
                                </span>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-5">
                                <ChartLegend
                                    label="Correct"
                                    value={statistics.correct}
                                    primary
                                />

                                <ChartLegend
                                    label="Incorrect"
                                    value={statistics.incorrect}
                                />

                                <ChartLegend
                                    label="Not answered"
                                    value={statistics.unansweredMcq}
                                />
                            </div>
                        </div>
                    )}
                </ChartCard>
            </div>

            {/* Question performance */}
            {questions.length > 0 && (
                <ChartCard
                    title="Question performance"
                    description="Awarded points versus maximum points for every question."
                    icon={<BarChart3 className="size-4" />}
                >
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={performanceChartData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: -10,
                                    bottom: 5,
                                }}
                                barGap={6}
                            >
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{
                                        fontSize: 12,
                                    }}
                                />

                                <YAxis
                                    allowDecimals={false}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{
                                        fontSize: 12,
                                    }}
                                />

                                <Tooltip
                                    cursor={{
                                        fill: "hsl(var(--secondary))",
                                        opacity: 0.5,
                                    }}
                                    contentStyle={{
                                        borderRadius: "12px",
                                        border: "1px solid hsl(var(--border))",
                                        background: "hsl(var(--background))",
                                    }}
                                />

                                <Bar
                                    dataKey="awarded"
                                    name="Awarded"
                                    fill="hsl(var(--primary))"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={32}
                                />

                                <Bar
                                    dataKey="maximum"
                                    name="Maximum"
                                    fill="hsl(var(--secondary))"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={32}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            )}

            {/* Performance summary */}
            <div className="rounded-2xl border border-border bg-background p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-semibold">Overall performance</h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Points awarded compared with the assessment maximum.
                        </p>
                    </div>

                    <div className="text-left sm:text-right">
                        <p className="text-2xl font-bold text-primary">
                            {formatNumber(percentage)}%
                        </p>

                        <p className="text-xs text-muted-foreground">
                            {formatNumber(statistics.awardedPoints)} /{" "}
                            {formatNumber(maxPoints)} points
                        </p>
                    </div>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-secondary">
                    <motion.div
                        initial={{
                            width: 0,
                        }}
                        animate={{
                            width: `${Math.min(Math.max(percentage, 0), 100)}%`,
                        }}
                        transition={{
                            duration: 0.8,
                            ease: "easeOut",
                        }}
                        className="h-full rounded-full bg-primary"
                    />
                </div>

                <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                    <MiniMetric
                        label="Answered"
                        value={`${statistics.answered}/${statistics.total}`}
                    />

                    <MiniMetric
                        label="Graded"
                        value={`${statistics.gradedQuestions}/${statistics.total}`}
                    />

                    <MiniMetric
                        label="Average question score"
                        value={`${formatNumber(
                            statistics.averageQuestionScore,
                        )}%`}
                    />
                </div>
            </div>

            {/* Assessment information */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InfoCard
                    label="Status"
                    value={attempt?.status ?? assignment?.status ?? "Unknown"}
                />

                <InfoCard
                    label="Submission"
                    value={attempt?.submissionType ?? "—"}
                />

                <InfoCard
                    label="Started"
                    value={formatDate(attempt?.startedAt)}
                />

                <InfoCard
                    label="Submitted"
                    value={formatDate(attempt?.submittedAt)}
                />
            </div>

            {/* Security information */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InfoCard
                    label="Tab changes"
                    value={String(attempt?.tabChangeCount ?? 0)}
                />

                <InfoCard
                    label="Graded"
                    value={`${statistics.gradedQuestions}/${statistics.total}`}
                />

                <InfoCard
                    label="Unanswered"
                    value={String(statistics.unanswered)}
                />

                <InfoCard
                    label="Expired"
                    value={attempt?.status === "expired" ? "Yes" : "No"}
                />
            </div>

            {/* Candidate answers */}
            <section>
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Candidate answers
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Review every question, submitted answer, correct
                            answer, and grading information.
                        </p>
                    </div>

                    <div className="rounded-full bg-secondary text-white px-3 py-1 text-sm font-medium">
                        {statistics.answered} of {statistics.total} answered
                    </div>
                </div>

                {questions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-10 text-center">
                        <FileText className="mx-auto size-8 text-muted-foreground" />

                        <h3 className="mt-3 font-semibold">
                            No questions found
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                            There are no questions available for this assessment
                            result.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {questions.map((question, index) => (
                            <AnswerCard
                                key={question.questionId ?? index}
                                question={question}
                                index={index}
                                draft={getDraft(question)}
                                onDraftChange={(field, value) =>
                                    updateDraft(
                                        question.questionId,
                                        field,
                                        value,
                                    )
                                }
                                onGrade={() => handleGrade(question)}
                                isGrading={isGrading}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <motion.div
            whileHover={{
                y: -2,
            }}
            className="rounded-xl border border-border bg-background p-5 transition-colors hover:bg-primary/10"
        >
            <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {icon}
                </div>

                <span className="text-sm font-medium text-muted-foreground">
                    {label}
                </span>
            </div>

            <p className="mt-4 text-2xl font-semibold">{value}</p>
        </motion.div>
    );
}

function InfoCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </p>

            <p className="mt-2 text-sm font-semibold capitalize">{value}</p>
        </div>
    );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg bg-muted-foreground/10 border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">{label}</p>

            <p className="mt-1 font-semibold">{value}</p>
        </div>
    );
}

function ChartCard({
    title,
    description,
    icon,
    children,
}: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-border bg-background p-5">
            <div className="flex items-start gap-3">
                {icon && (
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {icon}
                    </div>
                )}

                <div>
                    <h2 className="font-semibold">{title}</h2>

                    {description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-5">{children}</div>
        </div>
    );
}

function ChartLegend({
    label,
    value,
    primary = false,
}: {
    label: string;
    value: number;
    primary?: boolean;
}) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <span
                className={`size-2 rounded-full ${
                    primary ? "bg-primary" : "bg-secondary"
                }`}
            />

            <span className="text-muted-foreground">{label}</span>

            <span className="font-semibold">{value}</span>
        </div>
    );
}

function EmptyChartMessage({
    text = "No question data is available.",
}: {
    text?: string;
}) {
    return (
        <div className="flex h-64 items-center justify-center rounded-xl bg-secondary/40 text-center text-sm text-muted-foreground">
            {text}
        </div>
    );
}

function AnswerCard({
    question,
    index,
    draft,
    onDraftChange,
    onGrade,
    isGrading,
}: {
    question: CandidateQuestion;
    index: number;
    draft: GradeDraft;
    onDraftChange: (field: keyof GradeDraft, value: string) => void;
    onGrade: () => Promise<void>;
    isGrading: boolean;
}) {
    const answer = question.answer;
    const grading = question.grading;

    const awardedPoints = Number(grading?.awardedPoints ?? 0);

    const maxPoints = Number(question.points ?? 0);

    const isCorrect = answer?.isCorrect === true;

    const isIncorrect = answer?.isCorrect === false;

    const selectedOptions = answer?.selectedOptions ?? [];

    const correctOptionIds = question.correctOptionIds ?? [];

    const optionMap = new Map(
        (question.options ?? []).map((option) => [option.optionId, option]),
    );

    const isMcq = question.type === "mcq";

    const hasAnswer = Boolean(answer?.answer) || selectedOptions.length > 0;

    const canManuallyGrade = !isMcq || question.autoEvaluate !== true;

    return (
        <motion.article
            initial={{
                opacity: 0,
                y: 8,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                delay: index * 0.03,
            }}
            className="overflow-hidden rounded-2xl border border-border bg-background"
        >
            <div className="border-b border-border p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                                Question {index + 1}
                            </span>

                            <span className="rounded-full bg-secondary text-white px-2.5 py-1 text-[11px] font-medium capitalize">
                                {question.type}
                            </span>

                            {question.required && (
                                <span className="rounded-full bg-secondary text-white px-2.5 py-1 text-[11px] font-medium">
                                    Required
                                </span>
                            )}

                            {question.autoEvaluate && (
                                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                                    Auto evaluated
                                </span>
                            )}
                        </div>

                        <h3 className="mt-3 font-medium leading-6">
                            {question.question}
                        </h3>
                    </div>

                    <div className="shrink-0 rounded-lg bg-background px-3 py-2 text-left sm:text-right">
                        <p className="font-semibold text-primary">
                            {formatNumber(awardedPoints)}/
                            {formatNumber(maxPoints)}
                        </p>

                        {isCorrect && (
                            <span className="mt-1 inline-flex items-center gap-1 text-xs text-primary">
                                <CheckCircle2 className="size-3.5" />
                                Correct
                            </span>
                        )}

                        {isIncorrect && (
                            <span className="mt-1 inline-flex items-center gap-1 text-xs text-destructive">
                                <XCircle className="size-3.5" />
                                Incorrect
                            </span>
                        )}

                        {!isCorrect && !isIncorrect && hasAnswer && (
                            <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Target className="size-3.5" />
                                Manual review
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-5 p-5">
                {/* Candidate answer */}
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Candidate answer
                    </p>

                    {selectedOptions.length > 0 ? (
                        <div className="space-y-2">
                            {selectedOptions.map((optionId, optionIndex) => {
                                const option = optionMap.get(optionId);

                                return (
                                    <div
                                        key={`${optionId}-${optionIndex}`}
                                        className="rounded-lg border border-border bg-muted-foreground/30 px-4 py-3 text-sm"
                                    >
                                        <span className="mr-2 font-semibold text-primary">
                                            {String.fromCharCode(
                                                65 + optionIndex,
                                            )}
                                            .
                                        </span>

                                        {option?.text ?? optionId}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-border  p-4">
                            <p className="whitespace-pre-wrap text-sm leading-6">
                                {answer?.answer || "No answer submitted."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Coding details */}
                {question.type === "coding" && question.language && (
                    <div className="grid gap-3 sm:grid-cols-2">
                        <InfoCard label="Language" value={question.language} />

                        <InfoCard
                            label="Evaluation"
                            value={
                                question.autoEvaluate ? "Automatic" : "Manual"
                            }
                        />
                    </div>
                )}

                {/* Correct answer */}
                {isMcq && correctOptionIds.length > 0 && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                            Correct option(s)
                        </p>

                        <div className="space-y-2">
                            {correctOptionIds.map((optionId, optionIndex) => {
                                const option = optionMap.get(optionId);

                                return (
                                    <div
                                        key={optionId}
                                        className="rounded-lg border border-primary/10 bg-background px-4 py-3 text-sm"
                                    >
                                        <span className="mr-2 font-semibold text-primary">
                                            {String.fromCharCode(
                                                65 + optionIndex,
                                            )}
                                            .
                                        </span>

                                        {option?.text ?? optionId}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Explanation */}
                {question.explanation && (
                    <div className="rounded-lg border border-border p-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Explanation
                        </p>

                        <p className="whitespace-pre-wrap text-sm leading-6">
                            {question.explanation}
                        </p>
                    </div>
                )}

                {/* Manual grading */}
                {canManuallyGrade && (
                    <div className="rounded-xl border border-border p-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="font-medium">Update result</p>

                                <p className="text-xs text-muted-foreground">
                                    Assign points and optionally add feedback.
                                </p>
                            </div>

                            {grading?.manuallyGraded && (
                                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                    Previously graded
                                </span>
                            )}
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-[160px_1fr]">
                            <div>
                                <label
                                    htmlFor={`points-${question.questionId}`}
                                    className="text-xs font-medium text-muted-foreground"
                                >
                                    Awarded points
                                </label>

                                <input
                                    id={`points-${question.questionId}`}
                                    type="number"
                                    min={0}
                                    max={maxPoints}
                                    step="0.01"
                                    value={draft.awardedPoints}
                                    onChange={(event) =>
                                        onDraftChange(
                                            "awardedPoints",
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Max: {maxPoints}
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor={`note-${question.questionId}`}
                                    className="text-xs font-medium text-muted-foreground"
                                >
                                    Grading note
                                </label>

                                <textarea
                                    id={`note-${question.questionId}`}
                                    rows={3}
                                    value={draft.gradingNote}
                                    onChange={(event) =>
                                        onDraftChange(
                                            "gradingNote",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Add feedback or an internal grading note..."
                                    className="mt-2 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Button
                                size="sm"
                                onClick={onGrade}
                                disabled={isGrading}
                            >
                                {isGrading ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 size-4" />
                                        Update Result
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Existing grading note */}
                {grading?.gradingNote && (
                    <div className="rounded-lg border border-border p-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Grading note
                        </p>

                        <p className="whitespace-pre-wrap text-sm leading-6">
                            {grading.gradingNote}
                        </p>
                    </div>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {grading?.manuallyGraded && (
                        <span className="rounded-full bg-secondary text-white px-2.5 py-1">
                            Manually graded
                        </span>
                    )}

                    {grading?.gradingType && (
                        <span className="rounded-full bg-secondary text-white px-2.5 py-1 capitalize">
                            {grading.gradingType}
                        </span>
                    )}

                    {grading?.gradedAt && (
                        <span>Graded {formatDate(grading.gradedAt)}</span>
                    )}

                    {answer?.answeredAt && (
                        <span>Answered {formatDate(answer.answeredAt)}</span>
                    )}
                </div>
            </div>
        </motion.article>
    );
}

function getInitials(name?: string) {
    if (!name) {
        return "?";
    }

    return name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

function sanitizeFileName(value: string) {
    return value
        .trim()
        .replace(/[^a-zA-Z0-9-_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();
}

function formatNumber(value: number) {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function formatDate(value?: string | Date | null) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function getThemeColor(variable: string): [number, number, number] {
    if (typeof window === "undefined") {
        return [40, 40, 40];
    }

    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(variable)
        .trim();

    if (!value) {
        return [40, 40, 40];
    }

    /*
     * Supports CSS variables stored
     * as HSL values, which is the
     * common shadcn/Tailwind setup.
     */
    const hslMatch = value.match(
        /^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/,
    );

    if (hslMatch) {
        const h = Number(hslMatch[1]) / 360;

        const s = Number(hslMatch[2]) / 100;

        const l = Number(hslMatch[3]) / 100;

        return hslToRgb(h, s, l);
    }

    return [40, 40, 40];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    if (s === 0) {
        const value = Math.round(l * 255);

        return [value, value, value];
    }

    const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) {
            t += 1;
        }

        if (t > 1) {
            t -= 1;
        }

        if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
        }

        if (t < 1 / 2) {
            return q;
        }

        if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }

        return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;

    const p = 2 * l - q;

    return [
        Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
        Math.round(hue2rgb(p, q, h) * 255),
        Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
    ];
}
