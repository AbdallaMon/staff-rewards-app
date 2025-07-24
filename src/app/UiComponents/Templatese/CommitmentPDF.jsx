"use client"
import React, {useState, useEffect} from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogActions,
    IconButton,
    FormControlLabel,
    Checkbox, CircularProgress
} from '@mui/material';
import {Worker, Viewer} from '@react-pdf-viewer/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '@react-pdf-viewer/core/lib/styles/index.css';
import {useToastContext} from '@/providers/ToastLoadingProvider';
import arabicFontBase64 from "@/app/UiComponents/Templatese/arabicFont";
import {IoMdClose} from "react-icons/io";
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import dayjs from "dayjs"; // If using toast loading context

const CommitmentPDF = ({user, setUser, get}) => {
    const [pdfBlob, setPdfBlob] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const {setLoading: setToastLoading} = useToastContext();
    const [confirmChecked, setConfirmChecked] = useState(false);
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        if (get) {
            async function getUserData() {
                setLoading(true)
                const request = await fetch(`/api/employee/private/${user.id}/commitment`)
                const result = await request.json()
                if (result.data) {
                    setUser({...user, ...result.data})
                }
                setLoading(false)
            }

            getUserData()
        }
    }, [])
    const generatePdf = () => {
        const doc = new jsPDF('p', 'pt', 'a4');

        // Add Arabic font
        doc.addFileToVFS("Amiri-Regular.ttf", arabicFontBase64);
        doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
        doc.setFont("Amiri");

        const pageWidth = doc.internal.pageSize.getWidth();
        doc.autoTableSetDefaults({
            styles: {font: 'Amiri', fontStyle: 'normal', halign: 'left', cellPadding: 3},
        });

        // Add logos and signature helper
        const addHeaderAndSignature = (signature) => {
            doc.addImage('/examLogo.png', 'PNG', 450, 15, 120, 50); // Right logoy
            doc.setFontSize(12);
            doc.text(`: توقيع`, 160, doc.internal.pageSize.getHeight() - 20,);
            doc.addImage(user.signature, 'PNG', 30, doc.internal.pageSize.getHeight() - 40, 100, 30);
        };

        // Page 1: Declaration content
        addHeaderAndSignature(user.signature);

// Increased header size and applied underline for emphasis
        doc.setFontSize(22);  // Increased the header size
        doc.text("إقرار وتعهد", pageWidth / 2, 100, {align: 'center', underline: true});

        doc.setFontSize(16);  // Subtitle slightly smaller than the main title
        doc.text("المتعهدين المكلفين بأداء مهام الرقابة على عمليات تطبيق الاختبارات الوطنية ", pageWidth / 2, 140, {align: 'center'});
        doc.text("   في مراكزة المعتمدة\n ", pageWidth / 2, 180, {align: 'center'});

        doc.setFontSize(12);  // Increase the regular font size for content
        doc.setLineHeightFactor(1.5);  // Set line spacing for readability

        const firstPageContent = [
            "تتضمن وثيقة الإقرار الأدوار واللوائح والمعلومات الأخرى التي تحتاج إليها لإدارة امتحانات اختبار الإمارات القياسي كموظف",
            "وهي توضح كل المتطلبات الضرورية التي يجب الالتزام بها قبل ، وأثناء ، وبعد كل اختبار. كما تصف كيفية الموظفة على الامتحانات",
            "تحافظ هذه المتطلبات على أعلى معايير النزاهة والجودة للاختبارات. لذا من الضروري أن يكون جميع الموظفين المشاركين على علم بهذه المتطلبات وأن يلتزموا بها بشكل تام",
            "تحدد اللوائح في هذه الوثيقة المتطلبات الإجرائية في إدارة تطبيق اختبار الامتحان. فيجب على الموظفين المشاركين اعتبار هذه الورقة كوثيقة رسمية وأن يلتزموا بجميع اللوائح الواردة فيها",
            "من خلال توقيعك بالأحرف الأولى في كل صفحة وتوقيعك المعتمد في الصفحة الأخيرة ، فأنت تقر بأنك تفهم وتلتزم بجميع محتويات هذا المستند"
        ];

        let firstPageYPosition = 240;  // Starting y position for the first line of text
        const margin = 40;    // Left and right margin
        const firstXPosition = pageWidth - margin;  // Start at the right margin
        const maxWidth = pageWidth + 100;  // Define the maximum width for the text block

        firstPageContent.forEach((line, index) => {
            // Split the text to fit within the defined maxWidth
            const wrappedLines = doc.splitTextToSize(line, maxWidth);

            wrappedLines.forEach((wrappedLine, localIndex) => {
                if (localIndex === 0 && localIndex === wrappedLines.length - 1) {
                    doc.text(`. ${wrappedLine} `, firstXPosition, firstPageYPosition, {align: 'right'}); // Add bullet point
                } else if (localIndex === wrappedLines.length - 1) {
                    doc.text(`. ${wrappedLine}`, firstXPosition, firstPageYPosition, {align: 'right'}); // Add bullet point
                } else {
                    doc.text(wrappedLine, firstXPosition, firstPageYPosition, {align: 'right'});
                }
                firstPageYPosition += 24;
            });

            if (index < firstPageContent.length - 1) {
                firstPageYPosition += 20;  // Add a margin only between different index blocks
            }
        });


        // Page 2: User-specific content
        doc.addPage();
        addHeaderAndSignature(user.signature);
        const secondPageContent = [
            `${user.name} أقر وأتعهد أنا الموقع أدناه `,
            `والمكلف بأعمال الموظفة في الاختبارات الوطنية بأني سألتزم باتباع وتنفيذ القوانين واللوائح  والتعليمات الصادرة من وزارة التربية والتعليم والممثلة بإدارة تطبيق الاختبارات الوطنية والدولية خلال فترة التعاقد وأي تعليمات قد تحددها إدارة الاختبارات الوطنية فيما بعد ، ويحق للإدارة اتخاذ الإجراءات اللازمة من جراء مخالفة أي من التعليمات ، ويتضمن ذلك على سبيل المثال وليس الحصر`
        ];

        const secondPageBulletPoints = [
            "الالتزام بتنفيذ جميع التعليمات الصادرة من مشرف المركز المسؤول في يوم الاختبار والتي قد يتم مشاركتها بصورة دورية قبيل كل جلسة اختبارية",
            "الالتزام بعدم اتخاذ أي قرار بخصوص أي إجراءات في المركز دون الرجوع إلى المشرف المسؤول تحت أي ظرف من الظروف",
            "يجب الالتزام بالعمل على جميع أنواع الرقابة المطلوبة منه من جهة المركز ورئيس لجنة الموظفين بحيث يجب أن يمارس مهام الرقابة الأساسية والاحتياط خلال العام بحيث ألا تشكل نسبة الاحتياط 30% كحد أقصى",
            "الإبلاغ المشرف المسؤول عن حالات الغش أو محاولة الغش ، محاولة رشوة الموظف ، وتزوير المعلومات المقدمة للتسجيل وإبراز الوثائق الرسمية للحضور",
            "المواظبة على مواعيد العمل وعدم التأخير أو الغياب أو الاعتذار عن الموظفة قبل موعد الاختبار بثلاثة أيام إلا تحت الظروف القاهرة وذلك بإعلام رئيس لجنة الموظفين. إذا تم تكرار الاعتذار لثلاث مرات  يتم استبعاد الموظف تلقائيا لفترة تقدر بثلاثة أشهر كحد أدنى",
            "يتواجد الموظفين الاحتياط في مواعيد العمل الرسمية المعلنة عنها من قبل المركز ورئيس لجنة الموظفين بحيث يكون من مهامه المساعدة في منطقة التسجيل بالتحقق من توفر المستندات اللازمة وتنظيم دخول المرشحين إلى القاعات الصحيحة حسب تعليمات المشرف المسؤول عن الجلسة",
            "على الموظفين الاحتياط، عدم مغادرة مقر المركز بعد الانتهاء الوقت المخصص في منطقة التسجيل ، والتواجد بشكل قريب من قاعات الاختبار وذلك لأخذ دور الرقابة أو التواصل مع مشرف المركز في حال حدوث أي مشكلة تقنية وجب الإبلاغ عنها أو تنظيم عملية دخول وخروج الطلبة من وإلى القاعات بسلاسة",
            "عدم الاجتهاد تحت أي ظرف طارئ باتخاذ القرارات دون الرجوع إلى مشرفي الاختبارات في المركز",
            "يلتزم الموظف بعدم اتخاذ القرارات بالسماح للمرشحين بتقديم اختبار الإمارات القياسي في المركز إذا لم يحمل اسم المركز ذاته على تذكرة الاختبار الخاصة به دون الرجوع إلى مشرف الاختبار المسؤول في الجلسة",
            "لا ينبغي تحت أي ظرف ، أن يقوم الموظف بتحصيل مبالغ مالية أو عينية من الأفراد أو ذويهم أو الجهات الأخرى لإجراءات تسجيل أو تقديم اختبارات الإمارات القياسية في قاعات المركز",
            "الالتزام بالاستخدام الصحيح لأجهزة كشف المعادن في منطقة التسجيل وجميع قاعات الاختبار وذلك لمنع وجود أي من الأجهزة الذكية داخل القاعات",
            "الالتزام بتنفيذ التعليمات في قاعات الاختبار فقط وبناءً على الصلاحيات المعطاة من قبل مشرف المركز فقط"
        ];

        let secondYPosition = 80;  // Starting y position for the first line of text
        let secondXPosition = pageWidth - margin;  // Start at the left margin
        secondPageContent.forEach((line, index) => {
            const wrappedLines = doc.splitTextToSize(line, maxWidth);  // Wrap text
            wrappedLines.forEach((wrappedLine, localIndex) => {
                if (index === secondPageContent.length - 1 && localIndex === wrappedLines.length - 1) {
                    doc.text(`: ${wrappedLine}`, secondXPosition, secondYPosition, {align: 'right'}); // Add bullet point
                    secondYPosition += 20
                } else {
                    doc.text(wrappedLine, secondXPosition, secondYPosition, {align: 'right'});
                }
                secondYPosition += 20;  // Increase y position for the next line
            });
        });
        secondXPosition = secondXPosition - 15

        secondPageBulletPoints.forEach((point, index) => {
            const wrappedLines = doc.splitTextToSize(point, maxWidth);  // Wrap text
            wrappedLines.forEach((wrappedLine, localIndex) => {
                if (localIndex === 0 && localIndex === wrappedLines.length - 1) {
                    doc.text(`. ${wrappedLine} -`, secondXPosition, secondYPosition, {align: 'right'}); // Add bullet point
                } else if (localIndex === 0) {
                    doc.text(`${wrappedLine} -`, secondXPosition, secondYPosition, {align: 'right'}); // Add bullet point
                } else if (localIndex === wrappedLines.length - 1) {
                    doc.text(`. ${wrappedLine}`, secondXPosition, secondYPosition, {align: 'right'}); // Add bullet point
                } else {
                    doc.text(wrappedLine, secondXPosition, secondYPosition, {align: 'right'});
                }
                secondYPosition += 20;
            });
            if (index < secondPageBulletPoints.length - 1) {
                secondYPosition += 10;
            }
        });

        doc.addPage();  // Add new page for the next section
        addHeaderAndSignature(user.signature);

        const thirdPageBulletPoints = [
            "التأكد من أنه ليس بحوزة المتقدمين للاختبار أي مواد غير مصرح بها خلال مواعيد اختبار الإمارات القياسي على سبيل المثال الأوراق او الأجهزة الذكية أو أي من المواد الملموسة المشتبه بها",
            "وضع جميع الأمتعة الشخصية في الخزانة المخصصة بمركز الاختبار، بما في ذلك الهواتف المحمولة ، والساعات ، وأجهزة الكمبيوتر اللوحية ، وأجهزة الكمبيوتر ، وأي جهاز مع قدرات الإرسال أو الاستقبال ) على سبيل المثال ، بلوتوث ( ، والمواد الدراسية ، والملاحظات ، وما إلى ذلك",
            "المحافظة على سرية مواد الاختبار وعدم محاولة أو إعادة إنتاجها وعدم تقديم أي معلومات تتعلق بمحتوى الاختبار لأي شخص، ويشمل ذلك المنشورات المتعلقة بمحتوى الاختبار و/أو الإجابات على الإنترنت",
            "التأكد من عدم اقتناء المتقدمين للاختبار أي من الهواتف المحمولة والسماعات والساعات الإلكترونية أو أي نوع من الأجهزة الذكية داخل قاعة الاختبار وعند مغادرة قاعة الاختبار إلا بوجود الموظف الاحتياطي وللضرورة القصوى",
            "عدم حيازة أي من المواد الدراسية أو الملاحظات أو الأوراق أو الأجهزة الإلكترونية الذكية",
            "التقيد بعدم تسريب أسئلة الاختبار أو أخذ صور باستخدام الهاتف الشخصي",
            "عدم التدخل بتوضيح أي من أسئلة الاختبار للمرشحين أو قراءتها أو بمناقشة مشرف الاختبار باحتمالية وجود حل أو تعديل في الأسئلة ، بحيث يجب التنويه بالالتزام بأداء مهام الرقابة فقط باستثناء التخصص الجامعي أو المنهي الذي يمارسه الموظف خارج بيئة المركز",
            "كموظف في مركز تطبيق اختبار الإمارات القياسي، فإنه غير مصرح بنشر أي معلومات تتعلق باختبارات الإمارات القياسية EmSAT أو عملياتها أو إجراءاتها أو نتائجها والتقارير الخاصة بها لخارج نطاق المركز",
            "الحفاظ على سرية المعلومات الصادرة من مشرف المركز وجميع معلومات الاختبار وتقارير الحادثة في قاعة الاختبار وعدم التصريح بها إلا لمشرف الاختبار المسؤول عن الجلسة",
            "المحافظة على سرية وأمن البيانات داخل قاعة الاختبار فقط وعدم الفصح عنها تحت أي ظرف",
            "داخل مبنى الوزارة ، يمنع التدخين تمامًا ، يجب التوجه إلى المكان المخصص لذلك وفي غير أثناء القيام بمهام الرقابة",
            "الالتزام بضبط السلوك وتأكيد على قيم العمل الجماعي والتعاون مع الآخرين ، وذلك باحترام القوانين والنظم واللوائح ذات الصلة والتقييد بأرفع المعايير الأخلاقية في سلوكه وتصرفه",
            "النزاهة والأمانة: الالتزام بالسلوكيات الصائبة تحت أي ظرف من الظروف",
            "الشفافية: التعامل مع الآخرين بأسلوب يتسم بالوضوح والصدق والأمانة",
            "الاحترام: احترام الطلبة والزملاء وأولياء الأمور والمجتمع والموظفين المسؤولين",
            "المساءلة: تحمل الفرد مسؤولية أقواله وأفعاله",
            "التحلي بالسلوكيات التي تحقق مصلحة المترشحين وتفي بالاهتمام اللازم لهم واتخاذ كافة ما لديهم من صلاحيات لضمان سلامتهم",
            "عدم الإساءة إلى أي من الزملاء ، ويشمل ذلك ارتكاب أي سلوك غير ملائم يتسبب في شعور الزميل بعدم الأمان أو عدم الاطمئنان",
            "نشر أخبار كاذبة أو تشويه سمعة أي زميل ، أو إفشاء أية معلومات سرية تخص أي زميل"
        ];
        let thirdYPosition = 80;  // Starting y position for the first line of text
        const thirdXPosition = pageWidth - margin - 15;  // Start at the left margin
        thirdPageBulletPoints.forEach((point, index) => {
            const wrappedLines = doc.splitTextToSize(point, maxWidth);  // Wrap text
            wrappedLines.forEach((wrappedLine, localIndex) => {
                if (localIndex === 0 && localIndex === wrappedLines.length - 1) {
                    doc.text(`. ${wrappedLine} -`, thirdXPosition, thirdYPosition, {align: 'right'}); // Add bullet point
                } else if (localIndex === 0) {
                    doc.text(`${wrappedLine} -`, thirdXPosition, thirdYPosition, {align: 'right'}); // Add bullet point
                } else if (localIndex === wrappedLines.length - 1) {
                    doc.text(`. ${wrappedLine}`, thirdXPosition, thirdYPosition, {align: 'right'}); // Add bullet point
                } else {
                    doc.text(wrappedLine, thirdXPosition, thirdYPosition, {align: 'right'});
                }
                thirdYPosition += 20;
            });
            if (index < thirdPageBulletPoints.length - 1) {
                thirdYPosition += 5;
            }
        });


        // Page 3: Additional content
        doc.addPage();
        addHeaderAndSignature(user.signature);
        doc.setFontSize(12);
        const fourthPageBulletPoints = [
            "إصدار التعليقات والتصريحات العامة التي تسئ لسمعة الزملاء أو الإدارة بشكل عام، وخاصة إذا كان ذلك بصفة غير رسمية",
            "تبادل الاحترام بين الموظفين وأولياء الأمور والمجتمع المحلي الخارجي والتعاون معهم في إطار العملية التربوية بغرض الارتقاء بمستوى اختبار المرشحين",
            "الاطلاع على لائحة السلوك المنهي واستيعاب أحكامها وإعلاء معاييرها في كافة ما يقومون به من أعمال وتصرفات",
            "عدم مخالفة أحكام وتعليمات السلامة والصحة المهنية والإجراءات الاحترازية",
            "عدم ترك قاعة الاختبار قبل انتهاء مواعيد العمل المحددة بدون إذن المشرف المسؤول",
            "عدم التحدث مع الطلبة في قاعة الاختبار أثناء تأدية الاختبار ما لم تكن هناك توجيهات من الإدارة المعنية",
            "الالتزام بحسن التعامل مع الزملاء والمنسقين والمشرفين في مركز الاختبار",
        ];


        let fourthYPosition = 80;  // Starting y position for the first line of text
        let fourthXPosition = pageWidth - margin - 15;  // Start at the left margin
        fourthPageBulletPoints.forEach((point, index) => {
            const wrappedLines = doc.splitTextToSize(point, maxWidth);  // Wrap text
            wrappedLines.forEach((wrappedLine, localIndex) => {
                if (localIndex === 0 && localIndex === wrappedLines.length - 1) {
                    doc.text(`. ${wrappedLine} -`, fourthXPosition, fourthYPosition, {align: 'right'}); // Add bullet point
                } else if (localIndex === 0) {
                    doc.text(`${wrappedLine} -`, fourthXPosition, fourthYPosition, {align: 'right'}); // Add bullet point
                } else if (localIndex === wrappedLines.length - 1) {
                    doc.text(`. ${wrappedLine}`, fourthXPosition, fourthYPosition, {align: 'right'}); // Add bullet point
                } else {
                    doc.text(wrappedLine, fourthXPosition, fourthYPosition, {align: 'right'});
                }
                fourthYPosition += 20;
            });
            if (index < thirdPageBulletPoints.length - 1) {
                fourthYPosition += 5;
            }
        });
        const bulletOneTitle = "الدين والثقافة والعادات والتقاليد المجتمعية"
        doc.text(`: ${bulletOneTitle} -`, fourthXPosition, fourthYPosition, {align: 'right'}); // Add bullet point
        fourthYPosition += 20;
        const subBullets1 = [
            "على الموظفين توقير الدين وتقدير الثقافة العربية وقيم المجتمع الإماراتي وأخلاقه وعاداته وتقاليده",
            "احترام الديانات الأخرى وإظهار التسامح معهم",
            "احترام العادات والتقاليد الوطنية في أي مكان من أماكن العمل",
            "القيام بسلوكيات تخالف القيم الإسلامية داخل قاعات الاختبارات أو أماكن العمل"
        ];
        fourthXPosition = fourthXPosition - 40
        subBullets1.forEach((point, index) => {
            const wrappedLines = doc.splitTextToSize(point, maxWidth);  // Wrap text
            wrappedLines.forEach((wrappedLine, localIndex) => {
                if (localIndex === 0 && localIndex === wrappedLines.length - 1) {
                    doc.text(`. ${wrappedLine} -`, fourthXPosition, fourthYPosition, {align: 'right'}); // Add bullet point
                } else if (localIndex === 0) {
                    doc.text(`${wrappedLine} -`, fourthXPosition, fourthYPosition, {align: 'right'}); // Add bullet point
                } else if (localIndex === wrappedLines.length - 1) {
                    doc.text(`. ${wrappedLine}`, fourthXPosition, fourthYPosition, {align: 'right'}); // Add bullet point
                } else {
                    doc.text(wrappedLine, fourthXPosition, fourthYPosition, {align: 'right'});
                }
                fourthYPosition += 20;
            });
            if (index < thirdPageBulletPoints.length - 1) {
                fourthYPosition += 5;
            }
        });
        fourthXPosition = fourthXPosition + 40

        // Sub-bullets for "الدين والثقافة والعادات والتقاليد المجتمعية"
        const bulletTwoTitle = "تضارب المصالح"

        doc.text(`: ${bulletTwoTitle} -`, fourthXPosition, fourthYPosition, {align: 'right'}); // Add bullet point
        fourthYPosition += 20;
        const subBullets2 = [
            " تجنب الموظفين أي موقف يمثل أو يمكن أن يمثل تضارب في المصالح أثناء أداء واجباتهم ومهام وظائفهم",
            "الإحجام عن استغلال المناصب لتحقيق مكاسب شخصية",
            "القيام بإبلاغ الرؤساء في حال وجود تضارب محتمل في المصالح",
            "التدخل في اتخاذ أي قرار رسمي قد يستفيد منه أحد أفراد العائلة أو الأصدقاء"
        ];

        fourthXPosition = fourthXPosition - 40
        subBullets2.forEach((point, index) => {
            const wrappedLines = doc.splitTextToSize(point, maxWidth);  // Wrap text
            wrappedLines.forEach((wrappedLine, localIndex) => {
                if (localIndex === 0 && localIndex === wrappedLines.length - 1) {
                    doc.text(`. ${wrappedLine} -`, fourthXPosition, fourthYPosition, {align: 'right'}); // Add bullet point
                } else if (localIndex === 0) {
                    doc.text(`${wrappedLine} -`, fourthXPosition, fourthYPosition, {align: 'right'}); // Add bullet point
                } else if (localIndex === wrappedLines.length - 1) {
                    doc.text(`. ${wrappedLine}`, fourthXPosition, fourthYPosition, {align: 'right'}); // Add bullet point
                } else {
                    doc.text(wrappedLine, fourthXPosition, fourthYPosition, {align: 'right'});
                }
                fourthYPosition += 20;
            });
            if (index < thirdPageBulletPoints.length - 1) {
                fourthYPosition += 5;
            }
        });

        fourthXPosition = fourthXPosition + 40

        doc.setFontSize(10)
        doc.text("في حال الإخلال بأي بند من بنود التعهد، يحق لمسؤول المركز رفع تقرير بذلك إلى مدير الإدارة أو من ينبه وإيقاف العمل مع الموظف دون", fourthXPosition, fourthYPosition, {align: 'right'});
        fourthYPosition += 20
        doc.text(". أن يترتب على ذلك أيةآثار قانونية", fourthXPosition, fourthYPosition, {align: 'right'});

        fourthYPosition += 12;

        doc.autoTable({
            startY: fourthYPosition,  // Start the table from the current Y position
            head: [['معلومات الموظف', ""]],  // Table header
            body: [
                [user.name || 'N/A', 'الاسم'],
                [user.emiratesId || 'N/A', 'رقم الهوية الإماراتية'],
                [user.phone || 'N/A', 'رقم الهاتف'],
                [user.email || 'N/A', 'البريد الإلكتروني'],
                ['', 'التوقيع'],
                [{
                    content: `${dayjs(new Date()).format("DD/MM/YYYY")} :تاريخ التوقيع              |               ${user.duty.name || 'N/A'} :الدور `,
                    colSpan: 2
                },]
            ],
            styles: {
                halign: 'right',  // Align text to the right
                fontSize: 12    // Font size for the table content
                , cellPadding: 6,

            },
            headStyles: {
                fillColor: [31, 31, 31],
                textColor: [255, 255, 255],
            },
            columnStyles: {
                0: {cellWidth: "auto", halign: 'right'},  // Fixed width for the key column (100px)
                1: {
                    cellWidth: 100, halign: 'right',

                },
            },
            theme: 'grid',  // Set the table theme to grid
            tableWidth: 'auto',  // Automatically adjust table width
            margin: {top: 10, bottom: 40, left: 40, right: 40},  // Adjust margins
        });

        const lastAutoTable = doc.lastAutoTable.finalY;  // Get the Y position of the last row in the table
        if (user.signature) {
            doc.addImage(user.signature, 'PNG', 350, lastAutoTable - 60, 60, 30);  // Adjust position & size as needed
        }
        const pdfBlob = doc.output('blob');
        setPdfBlob(pdfBlob);
        setIsDialogOpen(true);
    };

    const handleApprove = async () => {
        try {
            setToastLoading(true);
            const formData = new FormData();
            formData.append("commitment", pdfBlob, 'commitment-signed.pdf');

            const res = await handleRequestSubmit(
                  formData, setToastLoading, `employee/private/${user.id}`, true, "Uploading...", null, "PUT"
            );
            if (res.status === 200) {
                setIsDialogOpen(false);
                if (setUser) {

                    setUser((user) => ({...user, commitment: res.user.commitment}))
                }

            }
        } catch (err) {
            console.log(err, "error")
        }
    }

    return (
          <>
              <Button onClick={generatePdf} variant="contained" disabled={loading}>
                  {loading && <CircularProgress size={20}/>}
                  Preview and Approve
                  Commitment</Button>

              <Dialog fullScreen open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                  <DialogContent>
                      {pdfBlob && (
                            <Box
                                  sx={{
                                      width: '100%',
                                      maxWidth: {
                                          md: 600, lg: 800
                                      },
                                      mx: "auto",
                                      height: '100%',
                                      overflow: 'auto',
                                      border: '1px solid #ddd',
                                      display: 'flex',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      backgroundColor: '#f0f0f0',
                                      position: 'relative',
                                      py: 10
                                  }}
                            >
                                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                    <Viewer fileUrl={URL.createObjectURL(pdfBlob)}/>
                                </Worker>
                                <IconButton
                                      color="inherit"
                                      onClick={() => setIsDialogOpen(false)}
                                      sx={{
                                          position: 'fixed',
                                          top: '1rem',
                                          right: '1rem',
                                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                          color: 'white',
                                      }}
                                >
                                    <IoMdClose/>
                                </IconButton>
                            </Box>
                      )}
                  </DialogContent>
                  <DialogActions>
                      <ApprovalSection
                            handleApprove={handleApprove}
                            confirmChecked={confirmChecked}
                            setConfirmChecked={setConfirmChecked}

                      />
                  </DialogActions>
              </Dialog>

          </>
    );
};
const ApprovalSection = ({handleApprove, confirmChecked, setConfirmChecked}) => (
      <div className={"max:sm:flex flex-col gap-5 items-center justify-center"}>
          <FormControlLabel
                control={<Checkbox checked={confirmChecked}
                                   onChange={(e) => setConfirmChecked(e.target.checked)}/>}
                label="I confirm that the information provided above is accurate."
          />
          <Button
                variant="contained"
                color="success"
                onClick={handleApprove}
                disabled={!confirmChecked}
          >
              Approve and Submit
          </Button>
      </div>
);
export default CommitmentPDF;
