const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const cvs = [
  {
    filename: "CV_Ayesha_Khan_HR_Manager.pdf",
    name: "Ayesha Khan",
    email: "ayesha.khan@email.com",
    phone: "+92 321 1234567",
    city: "Lahore",
    university: "LUMS",
    role: "HR Manager",
    summary:
      "Experienced HR Manager with 8 years of expertise in talent acquisition, employee relations, and organizational development. SHRM-CP certified with a proven track record of building high-performing teams.",
    skills: [
      "Talent Acquisition",
      "Employee Relations",
      "SHRM-CP Certified",
      "Performance Management",
      "Compensation & Benefits",
      "HRIS Systems (SAP SuccessFactors)",
      "Labor Law Compliance",
      "Organizational Development",
      "Conflict Resolution",
      "Onboarding & Training",
    ],
    experience: [
      {
        title: "Senior HR Manager",
        company: "Unilever Pakistan",
        duration: "2020 - Present",
        details: [
          "Manage end-to-end recruitment for 200+ positions annually",
          "Reduced employee turnover by 25% through engagement initiatives",
          "Implemented new HRIS system across 3 locations",
        ],
      },
      {
        title: "HR Executive",
        company: "Nestlé Pakistan",
        duration: "2016 - 2020",
        details: [
          "Led talent acquisition for manufacturing and corporate divisions",
          "Conducted employee satisfaction surveys and action plans",
          "Managed onboarding programs for 150+ new hires per year",
        ],
      },
    ],
    education: "MBA Human Resource Management, LUMS (2016) - CGPA: 3.7/4.0",
    certifications: ["SHRM-CP", "PHR (Professional in Human Resources)"],
  },
  {
    filename: "CV_Bilal_Ahmed_Marketing.pdf",
    name: "Bilal Ahmed",
    email: "bilal.ahmed@email.com",
    phone: "+92 333 9876543",
    city: "Karachi",
    university: "IBA Karachi",
    role: "Digital Marketing Specialist",
    summary:
      "Results-driven Digital Marketing Specialist with 4 years of experience in SEO, Google Ads, and social media marketing. Proven ability to increase brand visibility and drive measurable ROI.",
    skills: [
      "SEO / SEM",
      "Google Ads (Certified)",
      "Social Media Marketing",
      "Content Strategy",
      "Google Analytics",
      "Facebook Ads Manager",
      "Email Marketing (Mailchimp)",
      "A/B Testing",
      "Copywriting",
      "HubSpot",
    ],
    experience: [
      {
        title: "Digital Marketing Lead",
        company: "Daraz Pakistan",
        duration: "2022 - Present",
        details: [
          "Managed $50K+ monthly ad spend across Google and Facebook",
          "Increased organic traffic by 180% through SEO optimization",
          "Led social media strategy reaching 500K+ followers",
        ],
      },
      {
        title: "Marketing Executive",
        company: "Careem",
        duration: "2020 - 2022",
        details: [
          "Executed email marketing campaigns with 35% open rates",
          "Managed Google Ads campaigns with 4x ROAS",
          "Created content calendar and managed social media accounts",
        ],
      },
    ],
    education:
      "BBA Marketing, IBA Karachi (2020) - CGPA: 3.5/4.0",
    certifications: [
      "Google Ads Certification",
      "HubSpot Inbound Marketing",
      "Facebook Blueprint",
    ],
  },
  {
    filename: "CV_Zara_Hassan_Designer.pdf",
    name: "Zara Hassan",
    email: "zara.hassan@email.com",
    phone: "+92 300 5551234",
    city: "Islamabad",
    university: "NUST",
    role: "Graphic Designer",
    summary:
      "Creative Graphic Designer with 3 years of experience specializing in branding, UI/UX design, and visual communication. Proficient in Adobe Creative Suite and Figma with a strong portfolio of corporate and startup projects.",
    skills: [
      "Adobe Photoshop",
      "Adobe Illustrator",
      "Adobe InDesign",
      "Figma",
      "Branding & Identity",
      "UI/UX Design",
      "Typography",
      "Motion Graphics (After Effects)",
      "Print Design",
      "Wireframing & Prototyping",
    ],
    experience: [
      {
        title: "Senior Graphic Designer",
        company: "Nayatel",
        duration: "2022 - Present",
        details: [
          "Designed complete brand identity for 3 product launches",
          "Created marketing collateral for digital and print campaigns",
          "Collaborated with UI/UX team on mobile app redesign",
        ],
      },
      {
        title: "Junior Designer",
        company: "Creative Jenga (Agency)",
        duration: "2021 - 2022",
        details: [
          "Designed social media graphics for 10+ client brands",
          "Created logo designs and brand guidelines",
          "Produced motion graphics for video marketing campaigns",
        ],
      },
    ],
    education:
      "BS Design, NUST School of Art, Design & Architecture (2021) - CGPA: 3.6/4.0",
    certifications: [
      "Google UX Design Certificate",
      "Adobe Certified Expert (ACE)",
    ],
  },
  {
    filename: "CV_Hassan_Ali_Data_Scientist.pdf",
    name: "Hassan Ali",
    email: "hassan.ali@email.com",
    phone: "+92 312 7778899",
    city: "Lahore",
    university: "FAST-NUCES",
    role: "Data Scientist",
    summary:
      "Data Scientist with 5 years of experience in machine learning, statistical modeling, and data-driven decision making. Strong background in Python, TensorFlow, and big data technologies.",
    skills: [
      "Python",
      "TensorFlow",
      "PyTorch",
      "Machine Learning",
      "Deep Learning",
      "Statistics & Probability",
      "SQL",
      "Pandas / NumPy",
      "Data Visualization (Matplotlib, Tableau)",
      "NLP",
      "Scikit-learn",
      "Apache Spark",
    ],
    experience: [
      {
        title: "Senior Data Scientist",
        company: "Systems Limited",
        duration: "2021 - Present",
        details: [
          "Built ML models for fraud detection with 95% accuracy",
          "Developed NLP pipeline for customer sentiment analysis",
          "Led a team of 3 data analysts on predictive analytics projects",
        ],
      },
      {
        title: "Data Analyst",
        company: "Teradata Pakistan",
        duration: "2019 - 2021",
        details: [
          "Performed statistical analysis on 10M+ row datasets",
          "Created Tableau dashboards for executive reporting",
          "Implemented ETL pipelines using Apache Spark",
        ],
      },
    ],
    education:
      "MS Data Science, FAST-NUCES Lahore (2019) - CGPA: 3.8/4.0",
    certifications: [
      "AWS Machine Learning Specialty",
      "Google Professional Data Engineer",
      "Deep Learning Specialization (Coursera)",
    ],
  },
  {
    filename: "CV_Sana_Raza_Accountant.pdf",
    name: "Sana Raza",
    email: "sana.raza@email.com",
    phone: "+92 345 6667788",
    city: "Islamabad",
    university: "University of Punjab",
    role: "Accountant",
    summary:
      "Detail-oriented Accountant with 6 years of experience in financial reporting, auditing, and tax compliance. ACCA qualified with expertise in SAP and ERP systems.",
    skills: [
      "ACCA Qualified",
      "Financial Reporting (IFRS)",
      "SAP FICO",
      "Tax Compliance",
      "Auditing",
      "Budgeting & Forecasting",
      "Microsoft Excel (Advanced)",
      "QuickBooks",
      "Cost Accounting",
      "Accounts Payable/Receivable",
    ],
    experience: [
      {
        title: "Senior Accountant",
        company: "Engro Corporation",
        duration: "2021 - Present",
        details: [
          "Prepare monthly financial statements for 3 business units",
          "Manage annual audit process with external auditors",
          "Implemented SAP FICO module for streamlined reporting",
        ],
      },
      {
        title: "Audit Associate",
        company: "KPMG Pakistan",
        duration: "2018 - 2021",
        details: [
          "Conducted financial audits for 15+ corporate clients",
          "Performed risk assessments and internal control evaluations",
          "Prepared tax returns and compliance documentation",
        ],
      },
    ],
    education:
      "B.Com Accounting, University of Punjab (2018) - CGPA: 3.4/4.0",
    certifications: [
      "ACCA (Association of Chartered Certified Accountants)",
      "SAP FICO Certification",
    ],
  },
];

function generateCV(cv) {
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const outputPath = path.join(__dirname, cv.filename);
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Name
  doc.fontSize(22).font("Helvetica-Bold").text(cv.name, { align: "center" });
  doc.moveDown(0.3);

  // Contact info
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(`${cv.email} | ${cv.phone} | ${cv.city}`, { align: "center" });
  doc.moveDown(0.5);

  // Line separator
  doc
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();
  doc.moveDown(0.5);

  // Summary
  doc.fontSize(12).font("Helvetica-Bold").text("PROFESSIONAL SUMMARY");
  doc.moveDown(0.3);
  doc.fontSize(10).font("Helvetica").text(cv.summary);
  doc.moveDown(0.7);

  // Skills
  doc.fontSize(12).font("Helvetica-Bold").text("SKILLS");
  doc.moveDown(0.3);
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(cv.skills.join("  •  "), { width: 495 });
  doc.moveDown(0.7);

  // Experience
  doc.fontSize(12).font("Helvetica-Bold").text("WORK EXPERIENCE");
  doc.moveDown(0.3);
  for (const exp of cv.experience) {
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(`${exp.title} — ${exp.company}`);
    doc.fontSize(9).font("Helvetica").text(exp.duration, { color: "#666" });
    doc.moveDown(0.2);
    for (const detail of exp.details) {
      doc.fontSize(10).font("Helvetica").text(`• ${detail}`, { indent: 15 });
    }
    doc.moveDown(0.5);
  }

  // Education
  doc.fontSize(12).font("Helvetica-Bold").text("EDUCATION");
  doc.moveDown(0.3);
  doc.fontSize(10).font("Helvetica").text(cv.education);
  doc.moveDown(0.7);

  // Certifications
  if (cv.certifications && cv.certifications.length > 0) {
    doc.fontSize(12).font("Helvetica-Bold").text("CERTIFICATIONS");
    doc.moveDown(0.3);
    for (const cert of cv.certifications) {
      doc.fontSize(10).font("Helvetica").text(`• ${cert}`);
    }
  }

  doc.end();
  console.log(`Generated: ${cv.filename}`);
}

// Generate all CVs
for (const cv of cvs) {
  generateCV(cv);
}

console.log("\nAll CVs generated successfully!");
