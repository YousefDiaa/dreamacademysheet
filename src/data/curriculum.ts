import { Subject } from "../types";

export const CURRICULUM_DATA: Subject[] = [
  {
    id: "physics",
    title: "الفيزياء",
    units: [
      {
        id: "phys-unit-1",
        title: "الوحدة الأولى: الكهربية التيارية والكهرومغناطيسية",
        chapters: [
          {
            id: "phys-ch-1",
            title: "الفصل الأول: التيار الكهربي وقانون أوم وقانون كيرشوف",
            lessons: [
              { id: "phys-l-1-1", title: "الدرس الأول: التيار الكهربي وقانون أوم" },
              { id: "phys-l-1-2", title: "الدرس الثاني: توصيل المقاومات" },
              { id: "phys-l-1-3", title: "الدرس الثالث: قانون أوم للدوائر المغلقة" },
              { id: "phys-l-1-4", title: "الدرس الرابع: قانون كيرشوف" }
            ]
          },
          {
            id: "phys-ch-2",
            title: "الفصل الثاني: التاثير المغناطيسي للتيار الكهربي وأجهزة القياس الكهربي",
            lessons: [
              { id: "phys-l-2-1", title: "الدرس الأول: التأثير المغناطيسي للتيار الكهربي" },
              { id: "phys-l-2-2", title: "الدرس الثاني: تابع التاثير المغناطيسي للتيار الكهربي" },
              { id: "phys-l-2-3", title: "الدرس الثالث: القوة المغناطيسية / عزم الازدواج" },
              { id: "phys-l-2-4", title: "الدرس الرابع: أجهزة القياس الكهربي" }
            ]
          },
          {
            id: "phys-ch-3",
            title: "الفصل الثالث: الحث الكهرومغناطيسي",
            lessons: [
              { id: "phys-l-3-1", title: "الدرس الأول: قانون فارادي / القوة الدافعة الكهربية المستحثة المتولدة في سلك مستقيم" },
              { id: "phys-l-3-2", title: "الدرس الثاني: الحث المتبادل بين ملفين / الحث الذاتي لملف" },
              { id: "phys-l-3-3", title: "الدرس الثالث: المولد الكهربي" },
              { id: "phys-l-3-4", title: "الدرس الرابع: المحول الكهربي / المحرك الكهربي" }
            ]
          },
          {
            id: "phys-ch-4",
            title: "الفصل الرابع: دوائر التيار المتردد",
            lessons: [
              { id: "phys-l-4-1", title: "الدرس الأول: دوائر التيار المتردد" },
              { id: "phys-l-4-2", title: "الدرس الثاني: تابع دوائر التيار المتردد" },
              { id: "phys-l-4-3", title: "الدرس الثالث: الدائرة المهتزة / دائرة الرنين" }
            ]
          }
        ]
      },
      {
        id: "phys-unit-2",
        title: "الوحدة الثانية: مقدمة في الفيزياء الحديثة",
        chapters: [
          {
            id: "phys-ch-5",
            title: "الفصل الخامس: ازدواجية الموجة والجسيم",
            lessons: [
              { id: "phys-l-5-1", title: "الدرس الأول: إشعاع الجسم الأسود / الانبعاث الحراري والتاثير الكهروضوئي" },
              { id: "phys-l-5-2", title: "الدرس الثاني: ظاهرة كومتون / الطبيعة الموجية للجسيم / المجهر الإلكتروني" }
            ]
          },
          {
            id: "phys-ch-6",
            title: "الفصل السادس: الاطياف الذرية",
            lessons: [
              { id: "phys-l-6-1", title: "الدرس الأول: الاطياف الذرية" }
            ]
          },
          {
            id: "phys-ch-7",
            title: "الفصل السابع: الليزر",
            lessons: [
              { id: "phys-l-7-1", title: "الدرس الأول: الليزر" }
            ]
          },
          {
            id: "phys-ch-8",
            title: "الفصل الثامن: الالكترونيات الحديثة",
            lessons: [
              { id: "phys-l-8-1", title: "الدرس الأول: بللورة شبه الموصل/ الوصلة الثنائية" },
              { id: "phys-l-8-2", title: "الدرس الثاني: الترانزستور / الإلكترونيات التناظرية والرقمية" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "chemistry",
    title: "الكيمياء",
    units: [
      {
        id: "chem-unit-1",
        title: "الباب الأول: العناصر الانتقالية",
        chapters: [
          {
            id: "chem-ch-1",
            title: "الدروس الأساسية",
            lessons: [
              { id: "chem-l-1-1", title: "الدرس الأول: من بداية الباب إلى ما قبل الخصائص العامة لعناصر السلسلة الانتقالية الأولى" },
              { id: "chem-l-1-2", title: "الدرس الثاني: من الخصائص العامة لعناصر السلسلة الانتقالية الأولى إلى ما قبل فلز الحديد" },
              { id: "chem-l-1-3", title: "الدرس الثالث: من فلز الحديد إلى ما قبل خواص الحديد" },
              { id: "chem-l-1-4", title: "الدرس الرابع: من خواص الحديد إلى نهاية الباب" }
            ]
          }
        ]
      },
      {
        id: "chem-unit-2",
        title: "الباب الثاني: التحليل الكيميائي",
        chapters: [
          {
            id: "chem-ch-2",
            title: "الدروس الأساسية",
            lessons: [
              { id: "chem-l-2-1", title: "الدرس الأول: بداية الباب إلى ما قبل الكشف عن الكاتيونات" },
              { id: "chem-l-2-2", title: "الدرس الثاني: من الكشف عن الكاتيونات إلى ما قبل التحليل الكيميائي الكمي" },
              { id: "chem-l-2-3", title: "الدرس الثالث: من التحليل الكيميائي الكمي إلى نهاية الباب" }
            ]
          }
        ]
      },
      {
        id: "chem-unit-3",
        title: "الباب الثالث: الاتزان الكيميائي",
        chapters: [
          {
            id: "chem-ch-3",
            title: "الدروس الأساسية",
            lessons: [
              { id: "chem-l-3-1", title: "الدرس الأول: من بداية الباب إلى ما قبل العوامل المؤثرة على اتزان التفاعلات الكيميائية" },
              { id: "chem-l-3-2", title: "الدرس الثاني: من العوامل المؤثرة على اتزان التفاعلات الكيميائية إلى ما قبل الاتزان الأيوني" },
              { id: "chem-l-3-3", title: "الدرس الثالث: من الاتزان الأيوني إلى ما قبل التحليل المائي للأملاح" },
              { id: "chem-l-3-4", title: "الدرس الرابع: من التحليل المائي للأملاح إلى نهاية الباب" }
            ]
          }
        ]
      },
      {
        id: "chem-unit-4",
        title: "الباب الرابع: الكيمياء الكهربية",
        chapters: [
          {
            id: "chem-ch-4",
            title: "الدروس الأساسية",
            lessons: [
              { id: "chem-l-4-1", title: "الدرس الأول: من بداية الباب إلى قبل الخلايا الجلفانية وإنتاج الطاقة الكهربية" },
              { id: "chem-l-4-2", title: "الدرس الثاني: من الخلايا الجلفانية وإنتاج الطاقة إلى ما قبل الخلايا الإلكتروليتية" },
              { id: "chem-l-4-3", title: "الدرس الثالث: من خلايا الإلكتروليتية إلى نهاية الباب" }
            ]
          }
        ]
      },
      {
        id: "chem-unit-5",
        title: "الباب الخامس: الكيمياء العضوية",
        chapters: [
          {
            id: "chem-ch-5",
            title: "الدروس الأساسية",
            lessons: [
              { id: "chem-l-5-1", title: "الدرس الأول: من بداية الباب إلى ما قبل الألكانات" },
              { id: "chem-l-5-2", title: "الدرس الثاني: الألكانات" },
              { id: "chem-l-5-3", title: "الدرس الثالث: الميثان" },
              { id: "chem-l-5-4", title: "الدرس الرابع: الألكينات (الأوليفينات)" },
              { id: "chem-l-5-5", title: "الدرس الخامس: الألكينات (الأسيتيلينات)" },
              { id: "chem-l-5-6", title: "الدرس السادس: الهيدرؤكربونات الحلقية" },
              { id: "chem-l-5-7", title: "الدرس السابع: البنزين العطري" },
              { id: "chem-l-5-8", title: "الدرس الثامن: مشتقات الهيدروكربونات" },
              { id: "chem-l-5-9", title: "الدرس التاسع: الإيثانول" },
              { id: "chem-l-5-10", title: "الدرس العاشر: الفينولات" },
              { id: "chem-l-5-11", title: "الدرس الحادي عشر: الأحماض الكربوكسيلية" },
              { id: "chem-l-5-12", title: "الدرس الثاني عشر: الإسترات" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "english",
    title: "اللغة الإنجليزية",
    units: [
      {
        id: "eng-m-1",
        title: "MODULE 1: Making history",
        chapters: [
          {
            id: "eng-m1-u1",
            title: "Unit 1: Read all about it!",
            lessons: [
              { id: "eng-l-1-1", title: "Lessons 1 & 2" },
              { id: "eng-l-1-2", title: "Lessons 3 & 4" }
            ]
          },
          {
            id: "eng-m1-u2",
            title: "Unit 2: Her story",
            lessons: [
              { id: "eng-l-2-1", title: "Lessons 1 & 2" },
              { id: "eng-l-2-2", title: "Lessons 3 & 4" }
            ]
          },
          {
            id: "eng-m1-u3",
            title: "Unit 3: Beyond imagination",
            lessons: [
              { id: "eng-l-3-1", title: "Lessons 1 & 2" },
              { id: "eng-l-3-2", title: "Lessons 3 & 4" }
            ]
          },
          {
            id: "eng-m1-rev",
            title: "Revision",
            lessons: [
              { id: "eng-l-rev1", title: "Revision 1" }
            ]
          }
        ]
      },
      {
        id: "eng-m-2",
        title: "MODULE 2: Working well",
        chapters: [
          {
            id: "eng-m2-u4",
            title: "Unit 4: Taking care of ourselves",
            lessons: [
              { id: "eng-l-4-1", title: "Lessons 1 & 2" },
              { id: "eng-l-4-2", title: "Lessons 3 & 4" }
            ]
          },
          {
            id: "eng-m2-u5",
            title: "Unit 5: The future of work",
            lessons: [
              { id: "eng-l-5-1", title: "Lessons 1 & 2" },
              { id: "eng-l-5-2", title: "Lessons 3 & 4" }
            ]
          },
          {
            id: "eng-m2-u6",
            title: "Unit 6: Let's get it done",
            lessons: [
              { id: "eng-l-6-1", title: "Lessons 1 & 2" },
              { id: "eng-l-6-2", title: "Lessons 3 & 4" }
            ]
          },
          {
            id: "eng-m2-rev",
            title: "Revision",
            lessons: [
              { id: "eng-l-rev2", title: "Revision 2" }
            ]
          }
        ]
      },
      {
        id: "eng-m-3",
        title: "MODULE 3",
        chapters: [
          {
            id: "eng-m3-u7",
            title: "Unit 7: The meaning of success",
            lessons: [
              { id: "eng-l-7-1", title: "Lessons 1 & 2" },
              { id: "eng-l-7-2", title: "Lessons 3 & 4" }
            ]
          },
          {
            id: "eng-m3-u8",
            title: "Unit 8: Work experience",
            lessons: [
              { id: "eng-l-8-1", title: "Lessons 1 & 2" },
              { id: "eng-l-8-2", title: "Lessons 3 & 4" }
            ]
          },
          {
            id: "eng-m3-u9",
            title: "Unit 9: Starting again",
            lessons: [
              { id: "eng-l-9-1", title: "Lessons 1 & 2" },
              { id: "eng-l-9-2", title: "Lessons 3 & 4" }
            ]
          },
          {
            id: "eng-m3-rev",
            title: "Revision",
            lessons: [
              { id: "eng-l-rev3", title: "Revision 3" }
            ]
          }
        ]
      },
      {
        id: "eng-m-4",
        title: "MODULE 4",
        chapters: [
          {
            id: "eng-m4-u10",
            title: "Unit 10: Please of culture interest",
            lessons: [
              { id: "eng-l-10-1", title: "Lessons 1 & 2" },
              { id: "eng-l-10-2", title: "Lessons 3 & 4" }
            ]
          },
          {
            id: "eng-m4-u11",
            title: "Unit 11: Finding your culture",
            lessons: [
              { id: "eng-l-11-1", title: "Lessons 1 & 2" },
              { id: "eng-l-11-2", title: "Lessons 3 & 4" }
            ]
          },
          {
            id: "eng-m4-u12",
            title: "Unit 12: Myths and fables",
            lessons: [
              { id: "eng-l-12-1", title: "Lessons 1 & 2" },
              { id: "eng-l-12-2", title: "Lessons 3 & 4" }
            ]
          },
          {
            id: "eng-m4-rev",
            title: "Revision",
            lessons: [
              { id: "eng-l-rev4", title: "Revision 4" }
            ]
          },
          {
            id: "eng-m4-story",
            title: "Story",
            lessons: [
              { id: "eng-l-story", title: "Story: Great Expectations" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "mechanics",
    title: "الميكانيكا",
    units: [
      {
        id: "mech-u-1",
        title: "أولاً: الاستاتيكا",
        chapters: [
          {
            id: "mech-ch-1",
            title: "الوحدة الأولى: العزوم",
            lessons: [
              { id: "mech-l-1-1", title: "الدرس الأول: عزم قوة بالنسبة لنقطة في نظام إحداثي ثلاثي الأبعاد" }
            ]
          },
          {
            id: "mech-ch-2",
            title: "الوحدة الثانية: القوى المستوية",
            lessons: [
              { id: "mech-l-2-1", title: "الدرس الأول: محصلة القوى المتوازية المستوية" },
              { id: "mech-l-2-2", title: "الدرس الثاني: اتزان مجموعة من القوى المتوازية المستوية" }
            ]
          },
          {
            id: "mech-ch-3",
            title: "الوحدة الثالثة: الازدواجات",
            lessons: [
              { id: "mech-l-3-1", title: "الدرس الأول: الازدواج" },
              { id: "mech-l-3-2", title: "الدرس الثاني: الازدواج المحصل" }
            ]
          }
        ]
      },
      {
        id: "mech-u-2",
        title: "ثانياً: الديناميكا",
        chapters: [
          {
            id: "mech-ch-4",
            title: "الوحدة الأولى: الحركة في خط مستقيم",
            lessons: [
              { id: "mech-l-4-1", title: "الدرس الأول: تفاضل وتكامل الدوال المتجهة" }
            ]
          },
          {
            id: "mech-ch-5",
            title: "الوحدة الثانية: تطبيقات على قوانين نيوتن للحركة",
            lessons: [
              { id: "mech-l-5-1", title: "الدرس الأول: حركة الأجسام متغيرة الكتلة أو العجلة" },
              { id: "mech-l-5-2", title: "الدرس الثاني: حركة الأجسام المتصلة" },
              { id: "mech-l-5-3", title: "الدرس الثالث: الدفع" }
            ]
          },
          {
            id: "mech-ch-6",
            title: "الوحدة الثالثة: الشغل - الطاقة - القدرة",
            lessons: [
              { id: "mech-l-6-1", title: "الدرس الأول: الشغل" },
              { id: "mech-l-6-2", title: "الدرس الثاني: الطاقة" },
              { id: "mech-l-6-3", title: "الدرس الثالث: القدرة" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "algebra-geometry",
    title: "الجبر والهندسة الفراغية",
    units: [
      {
        id: "alg-u-1",
        title: "أولاً: الجبر Algebra",
        chapters: [
          {
            id: "alg-ch-1",
            title: "الوحدة الأولى: نظرية ذات الحدين",
            lessons: [
              { id: "alg-l-1-1", title: "الدرس الأول: نظرية ذات الحدين بأس صحيح موجب" },
              { id: "alg-l-1-2", title: "الدرس الثاني: إيجاد الحد المشتمل على س^ك من مفكوك ذات الحدين" },
              { id: "alg-l-1-3", title: "الدرس الثالث: النسبة بين حدين متتاليين من مفكوك ذات الحدين" }
            ]
          },
          {
            id: "alg-ch-2",
            title: "الوحدة الثانية: الأعداد المركبة",
            lessons: [
              { id: "alg-l-2-1", title: "الدرس الأول: الصورة المثلثية للعدد المركب" },
              { id: "alg-l-2-2", title: "الدرس الثاني: نظرية ديموافر" },
              { id: "alg-l-2-3", title: "الدرس الثالث: الجذور التكعيبية للواحد الصحيح" }
            ]
          }
        ]
      },
      {
        id: "alg-u-2",
        title: "ثانياً: الهندسة الفراغية Solid geometry",
        chapters: [
          {
            id: "geo-ch-1",
            title: "الوحدة الثالثة: الهندسة والقياس في بعدين وثلاثة أبعاد",
            lessons: [
              { id: "geo-l-1-1", title: "الدرس الأول: النظام الإحداثي المتعامد في ثلاثة أبعاد" },
              { id: "geo-l-1-2", title: "الدرس الثاني: المتجهات في الفراغ" },
              { id: "geo-l-1-3", title: "الدرس الثالث: ضرب المتجهات" }
            ]
          },
          {
            id: "geo-ch-2",
            title: "الوحدة الرابعة: الخطوط المستقيمة والمستويات في الفراغ",
            lessons: [
              { id: "geo-l-2-1", title: "الدرس الأول: معادلة المستقيم في الفراغ" },
              { id: "geo-l-2-2", title: "الدرس الثاني: معادلة المستوى في الفراغ" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "calculus",
    title: "التفاضل والتكامل",
    units: [
      {
        id: "calc-u-1",
        title: "أولاً: التفاضل",
        chapters: [
          {
            id: "calc-ch-1",
            title: "الوحدة الأولى: الاشتقاق وتطبيقاته",
            lessons: [
              { id: "calc-l-1-1", title: "الدرس الثاني: الاشتقاق الضمني والبارامتري" },
              { id: "calc-l-1-2", title: "الدرس الثالث: المشتقات العليا للدالة" },
              { id: "calc-l-1-3", title: "الدرس الرابع: مشتقات الدوال الأسية واللوغارتمية" },
              { id: "calc-l-1-4", title: "الدرس الخامس: المعادلات الزمنية المرتبطة" }
            ]
          },
          {
            id: "calc-ch-2",
            title: "الوحدة الثانية: سلوك الدالة ورسم المنحنيات",
            lessons: [
              { id: "calc-l-2-1", title: "الدرس الأول: تزايد وتناقص الدوال" },
              { id: "calc-l-2-2", title: "الدرس الثاني: القيم العظمى والصغرى (القيم القصوى)" },
              { id: "calc-l-2-3", title: "الدرس الثالث: دراسة المنحنيات" },
              { id: "calc-l-2-4", title: "الدرس الرابع: تطبيقات على القيم العظمى والصغرى" }
            ]
          }
        ]
      },
      {
        id: "calc-u-2",
        title: "ثانياً: التكامل",
        chapters: [
          {
            id: "calc-ch-3",
            title: "الوحدة الثالثة: التكامل المحدد وتطبيقاته",
            lessons: [
              { id: "calc-l-3-1", title: "الدرس الأول: تكامل الدوال الأسية واللوغاريتمية" },
              { id: "calc-l-3-2", title: "الدرس الثاني: طرق التكامل" },
              { id: "calc-l-3-3", title: "الدرس الثالث: التكامل المحدد" },
              { id: "calc-l-3-4", title: "الدرس الرابع: تطبيقات على التكامل المحدد" }
            ]
          }
        ]
      }
    ]
  }
];
