/**
 * @fileoverview Question bank for Sujit AI's local knowledge engine.
 *
 * Every answer here comes from verified sources: the portfolio, the markdown files in
 * knowledge/, or Sujit's own statements. Nothing is guessed. A question whose answer is not
 * on file gets an explicit "not on file" entry, so the assistant says so instead of inventing.
 *
 * Two kinds of entries:
 *   1. Hand-written entries (profile, contact, education, internships, founder, goals, ...)
 *   2. Generated entries: one set per knowledge/projects/*.md file, one per skill on the résumé,
 *      and the original 30 FAQ pairs. Drop a new project file into knowledge/projects/ and the
 *      assistant learns it on the next start, with no code change.
 *
 * Each entry: { id, topic, q: [phrasings], a: answer markdown, src: [source titles] }
 */

const fs = require('fs');
const path = require('path');

const KNOWLEDGE_DIR = fs.existsSync(path.join(__dirname, '..', 'knowledge'))
  ? path.join(__dirname, '..', 'knowledge')
  : path.join(__dirname, '..', '..', 'knowledge');

const EMAIL = 'sujitkumarsahu7334@gmail.com';
const L = {
  github: 'https://github.com/sujitsahu461',
  linkedin: 'https://www.linkedin.com/in/sujit-kumar-sahu-60b80531a',
  instagram: 'https://www.instagram.com/_sujit_.23',
  portfolio: 'https://portfolioo-sand-sigma.vercel.app',
  nivaranova: 'https://nivaranova-technologies.vercel.app/',
  certs: 'https://www.linkedin.com/in/sujit-kumar-sahu-60b80531a/details/certifications/',
};
const ASK_HIM = `Please ask Sujit directly at **${EMAIL}** or on [LinkedIn](${L.linkedin}).`;
const NOT_ON_FILE = (what) => `I don't have verified information about ${what} in Sujit's portfolio, so I won't guess. ${ASK_HIM}`;

const entries = [];
const e = (id, topic, q, a, src) => entries.push({ id, topic, q, a, src: src || ['Developer Profile'] });

/* ───────────── Identity and profile ───────────── */
e('who', 'profile', [
  'Who is Sujit?', 'Tell me about Sujit', 'Introduce Sujit', 'Give me a short introduction of Sujit Kumar Sahu',
  'What is Sujit known for?', 'Describe Sujit in one line', 'Who is the person behind this portfolio?', 'Give me an overview of Sujit',
], '**Sujit Kumar Sahu** is a Cybersecurity AI Engineer and Developer. He is a B.Tech Computer Science student at **GIET University, Gunupur (2024–2028)**, based in Sambalpur, Odisha, India. He builds intentionally secure systems, has completed 5 internships, built 10+ projects, and is the founder of **NivaraNova Technologies Pvt Ltd**.');
e('name', 'profile', ['What is Sujit full name?', 'What is his name?', 'Full name of Sujit', 'What does Sujit Kumar Sahu stand for', 'Whats the name of the developer'],
  "His full name is **Sujit Kumar Sahu**.");
e('title', 'profile', ['What is Sujit job title?', 'What does Sujit do?', 'What is his profession?', 'What is Sujit by profession?', 'What is his designation', 'What kind of developer is he'],
  'Sujit describes himself as a **Cybersecurity AI Engineer and Developer**. He is currently a B.Tech student, an intern-experienced full-stack developer, and the founder of NivaraNova Technologies.');
e('location', 'profile', ['Where is Sujit based?', 'Where does Sujit live?', 'What city is Sujit from?', 'Which state is he from', 'What is his location', 'Where is he located', 'Which country does Sujit live in', 'Is Sujit from India?'],
  'Sujit is based in **Sambalpur, Odisha, India** (timezone IST, UTC+5:30). He studies in Gunupur, Odisha, and NivaraNova Technologies is also based in Gunupur.');
e('timezone', 'profile', ['What timezone is Sujit in?', 'What time zone does he work in', 'What are his working hours timezone', 'IST or what'],
  'Sujit works in **IST (UTC+5:30)**. His exact working hours are not listed, so for meetings please email him.');
e('status', 'profile', ['Is Sujit available for work?', 'Is Sujit open to opportunities?', 'Can I hire Sujit?', 'Is he looking for a job?', 'Is Sujit available for freelance projects', 'Is he available for hire', 'Is Sujit open to internships'],
  `Yes. His profile status is **"Available for Opportunities & Projects"**. For internships, freelance work or collaborations, contact him at **${EMAIL}** or on [LinkedIn](${L.linkedin}).`, ['Developer Profile', 'Contact Information']);
e('strengths', 'profile', ['What are Sujit strengths?', 'What is Sujit best at?', 'What are his core strengths', 'What makes Sujit stand out?', 'What is his superpower', 'What does Sujit bring to a team'],
  'Sujit lists four core strengths:\n- **Security-first development**: threat modeling and secure design\n- **Full-stack engineering**: React, Node.js, Python and databases\n- **Scalable architecture**: systems built for growth\n- **AI/ML**: data analysis, model building and computer vision\n\nHe has also shipped 10+ projects and completed 5 internships.');
e('hobbies', 'profile', ['What are Sujit hobbies?', 'What does Sujit do in his free time?', 'What are his interests?', 'What does he do when not coding', 'What does Sujit like to do for fun', 'Tell me about his personal interests', 'What are his passions'],
  'Sujit\'s listed hobbies and interests are: **technology** (building and exploring new tools), **cybersecurity** (CTFs and ethical hacking), **learning** (research and self-improvement), **photography** (moments and nature), **cricket** (team sports and strategy) and **music** (listening and discovering artists).');
e('hobby-photo', 'profile', ['Does Sujit like photography?', 'Is Sujit a photographer?', 'Does he take photos'], 'Yes. **Photography** is one of Sujit\'s listed hobbies: capturing moments and nature.');
e('hobby-cricket', 'profile', ['Does Sujit play cricket?', 'Does Sujit like cricket?', 'Is he into sports', 'What sport does Sujit like'], 'Yes. **Cricket** is on Sujit\'s list of interests (team sports and strategy). He also built the IPL Analytics Crunch-26 project on cricket data.');
e('hobby-music', 'profile', ['Does Sujit like music?', 'What music does Sujit listen to', 'Is he a music person'], 'Yes. **Music** is one of Sujit\'s interests (listening and discovering artists). His favourite artists or genres are not on file.');
e('ctf', 'profile', ['Does Sujit do CTFs?', 'Has Sujit participated in CTF competitions?', 'Is Sujit into capture the flag', 'Does Sujit do ethical hacking in his free time'],
  'Yes. Sujit says he reads security research and participates in **CTF competitions** when he is not coding, and lists CTFs and ethical hacking among his interests. Specific CTF names or rankings are not on file.');
e('philosophy', 'profile', ['What is Sujit philosophy?', 'What is his development philosophy?', 'How does Sujit think about software?', 'What are his principles', 'What is his approach to coding', 'What does Sujit believe in', 'What is his motto', 'What is his life motto'],
  '**"I don\'t just learn technology. I build with it."**\n\nHis principles: security-first development, build to learn, scalable architecture, continuous learning, and production quality even in personal projects (error handling, input validation, rate limiting, deployment configuration).', ['Core Philosophy']);
e('bio', 'profile', ['What is on his GitHub bio?', 'What is Sujit GitHub tagline', 'What is written in his GitHub bio'], 'His GitHub bio reads **"Build. Break. Learn. Repeat."**', ['GitHub']);
e('quote', 'profile', ['What is Sujit favourite quote?', 'Does Sujit have a quote', 'Which quote does he follow'],
  'Sujit\'s own line on the site is **"I don\'t just learn technology. I build with it."** The closing quote section shows rotating quotes from well-known people; he has not named a single favourite.');
e('portfolio-about', 'profile', ['How was this portfolio built?', 'What is this website built with?', 'What tech stack does the portfolio use', 'How was this site made', 'Tell me about this portfolio website', 'What are the portfolio features'],
  'This portfolio is built with vanilla **HTML, CSS and JavaScript**, with GSAP and Lenis for animation and a custom canvas **galaxy fly-through** where each section is a planet. A Vercel serverless function feeds the live **GitHub Activity** section, and **Sujit AI** (me) answers questions about him. It is hosted on Vercel at ' + L.portfolio + '.', ['Web Development Skills']);
e('sujit-ai', 'meta', ['What is Sujit AI?', 'Who are you?', 'What are you?', 'What can you do?', 'What can I ask you?', 'Are you a bot?', 'Are you ChatGPT?', 'How do you work?', 'Who made you', 'Help'],
  'I am **Sujit AI**, the assistant on Sujit Kumar Sahu\'s portfolio. I answer questions about his background, education, internships, projects, skills, certifications, startup and contact details, using only verified information. I can also report his **live GitHub activity** (recent commits, repositories, contributions). If I don\'t know something, I say so instead of guessing.\n\nTry: "What projects has Sujit built?", "What did he do at MCL?" or "What did he commit recently?"');
e('greeting', 'meta', ['Hi', 'Hello', 'Hey', 'Hey there', 'Good morning', 'Good evening', 'Namaste', 'Hii', 'Yo', 'Hello Sujit AI'],
  'Hi! I\'m **Sujit AI**. Ask me anything about Sujit Kumar Sahu: his projects, skills, internships, certifications, his startup NivaraNova, or his latest GitHub activity.');
e('thanks', 'meta', ['Thanks', 'Thank you', 'Thanks a lot', 'Great, thank you', 'Awesome thanks', 'Cool thanks', 'That helped'],
  'You\'re welcome! If you want to go further, ask about his projects or internships, or reach him at **' + EMAIL + '**.');
e('bye', 'meta', ['Bye', 'Goodbye', 'See you', 'Talk later', 'Good night', 'Okay bye'], 'Goodbye! Feel free to come back anytime, or email Sujit at **' + EMAIL + '**.');
e('joke', 'meta', ['Tell me a joke', 'Say something funny', 'Make me laugh'], 'I stick to Sujit\'s verified story, so no jokes from me. Here is his own motto instead: **"Build. Break. Learn. Repeat."**');
e('weather-now', 'meta', ['What is the weather today?', 'What time is it?', 'Who won the match yesterday', 'What is the capital of France', 'Write me a poem', 'Solve this math problem', 'Write code for me'],
  'I can only help with questions about Sujit Kumar Sahu and his work. Try asking about his projects, skills, internships, certifications or GitHub activity.');


/* ───────────── Contact and links ───────────── */
e('email', 'contact', ['What is Sujit email?', 'How can I email Sujit?', 'Email address of Sujit', 'What is his mail id', 'How do I contact Sujit?', 'How can I reach Sujit', 'How to get in touch with Sujit', 'Contact details of Sujit', 'Where can I send a message to Sujit', 'How can recruiters contact him'],
  `You can reach Sujit at **${EMAIL}**.\n\n- LinkedIn: ${L.linkedin}\n- GitHub: ${L.github}\n- Instagram: ${L.instagram}\n- Portfolio contact section: ${L.portfolio}/#contact`, ['Contact Information']);
e('linkedin', 'contact', ['What is Sujit LinkedIn?', 'LinkedIn profile of Sujit', 'Link to his LinkedIn', 'Can I connect with Sujit on LinkedIn', 'Where can I see his LinkedIn'],
  `Sujit's LinkedIn: ${L.linkedin}`, ['Contact Information']);
e('github-link', 'contact', ['What is Sujit GitHub?', 'GitHub profile of Sujit', 'Link to his GitHub', 'GitHub username of Sujit', 'Where can I see his code', 'Where are his repositories'],
  `Sujit's GitHub: ${L.github} (username **sujitsahu461**).`, ['Contact Information']);
e('instagram', 'contact', ['What is Sujit Instagram?', 'Is Sujit on Instagram?', 'Instagram handle of Sujit'], `Sujit's Instagram: ${L.instagram}`, ['Contact Information']);
e('social-other', 'contact', ['Is Sujit on Twitter?', 'Is Sujit on X?', 'Does Sujit have a YouTube channel?', 'Is Sujit on Facebook?', 'Does he have a blog', 'Does Sujit have a Medium account', 'Is he on Discord', 'Telegram of Sujit', 'WhatsApp number of Sujit'],
  `The only social profiles on file are **LinkedIn** (${L.linkedin}), **GitHub** (${L.github}) and **Instagram** (${L.instagram}). I have nothing on file for other platforms or a messaging number.`, ['Contact Information']);
e('portfolio-link', 'contact', ['What is Sujit portfolio website?', 'Portfolio link of Sujit', 'What is the URL of this site', 'Where can I see his portfolio'], `Sujit's portfolio is at ${L.portfolio}.`, ['Contact Information']);
e('resume', 'contact', ['Can I download Sujit resume?', 'Where is his CV?', 'Does Sujit have a resume', 'Give me his resume', 'Sujit resume PDF', 'How can I get his CV'],
  'Sujit\'s résumé is a PDF on his portfolio website (Sujit-Kumar-Sahu-Resume.pdf). Use the résumé button on the site, or email him at **' + EMAIL + '** to request it.', ['Resume Summary']);
e('phone', 'private', ['What is Sujit phone number?', 'Can I call Sujit?', 'Mobile number of Sujit', 'Give me his contact number', 'Phone number please'],
  NOT_ON_FILE('a phone number'));
e('address', 'private', ['What is Sujit home address?', 'Where exactly does Sujit live?', 'His street address', 'Which locality does he live in', 'Give me his exact address'],
  NOT_ON_FILE('a home address (only the city, Sambalpur, Odisha, is public)'));
e('age', 'private', ['How old is Sujit?', 'What is Sujit age?', 'When is Sujit birthday?', 'What is his date of birth', 'Sujit DOB', 'What year was Sujit born'],
  NOT_ON_FILE('his age or date of birth'));
e('family', 'private', ['Tell me about Sujit family', 'Who are Sujit parents?', 'Does Sujit have siblings?', 'What does his father do', 'Is Sujit married?', 'Does Sujit have a girlfriend?', 'Is Sujit single', 'Is Sujit in a relationship', 'Who is his wife'],
  NOT_ON_FILE('his family or personal relationships'));
e('belief', 'private', ['What is Sujit religion?', 'What is Sujit caste?', 'What are Sujit political views?', 'Who does Sujit vote for', 'What is his religion', 'Is Sujit religious'],
  NOT_ON_FILE('his religion, caste or political views'));
e('salary', 'private', ['What is Sujit salary?', 'How much does Sujit earn?', 'What is his expected CTC', 'What are his rates?', 'What does Sujit charge for freelance', 'How much does it cost to hire Sujit', 'Is Sujit expecting a stipend'],
  NOT_ON_FILE('salary expectations or freelance rates'));
e('grades', 'private', ['What is Sujit CGPA?', 'What is Sujit GPA?', 'What are his marks?', 'What are his grades', 'What percentage did Sujit score', 'What was his 12th result', 'What rank did Sujit get', 'What is his semester result'],
  NOT_ON_FILE('his grades, CGPA or exam results'));
e('health', 'private', ['What is Sujit height?', 'What is Sujit health?', 'Does Sujit have any medical condition', 'What is his weight', 'What does Sujit look like'],
  NOT_ON_FILE('personal details such as health or appearance'));
e('favourites', 'private', ['What is Sujit favourite food?', 'What is his favourite movie?', 'What is his favourite colour', 'What is Sujit favourite game', 'Which is his favourite programming language', 'Favourite IDE of Sujit', 'What is his favourite book', 'Which cricketer does he like'],
  NOT_ON_FILE('his personal favourites'));
e('languages-spoken', 'private', ['What languages does Sujit speak?', 'Does Sujit speak Hindi?', 'Does Sujit speak English?', 'Does he know Odia', 'Which spoken languages does he know', 'Can Sujit speak Telugu'],
  NOT_ON_FILE('the spoken languages he knows'));
e('nationality', 'private', ['What is Sujit nationality?', 'Is Sujit an Indian citizen?', 'Does Sujit have a visa', 'Can Sujit work abroad', 'Is Sujit willing to relocate', 'Will Sujit relocate to another country', 'Does Sujit have a passport'],
  'Sujit is based in India (Sambalpur, Odisha). Nationality, visa status and relocation plans are **not on file**. ' + ASK_HIM, ['Developer Profile']);
e('awards', 'private', ['Has Sujit won any awards?', 'Has Sujit won a hackathon?', 'What are his achievements?', 'Did Sujit get any prizes', 'Has he published a research paper', 'Does Sujit have any publications', 'Has Sujit won a competition', 'Does Sujit have patents', 'Has Sujit given any talks'],
  'The verified achievements on file are his **5 internships, 10+ projects, 10 certifications, his GitHub work** and founding **NivaraNova Technologies**. I have no record of hackathon wins, awards, publications, patents or talks, so I won\'t claim any. ' + ASK_HIM, ['Certifications', 'Work Experience']);
e('work-mode', 'profile', ['Can Sujit work remotely?', 'Does Sujit prefer remote or onsite?', 'Is Sujit open to hybrid work', 'Can Sujit work on-site', 'Would Sujit work from office', 'Is Sujit okay with remote jobs'],
  'Sujit has worked both ways: **on-site** (MCL in Sambalpur, CTTC in Bhubaneswar) and **remotely** (EduSkills virtual internships, PreppRight in New Delhi). He is open to opportunities; work-mode preferences for a specific role are best discussed with him at **' + EMAIL + '**.', ['Work Experience']);

/* ───────────── Education ───────────── */
e('university', 'education', ['Where does Sujit study?', 'Which college does Sujit attend?', 'What university is Sujit in?', 'What is Sujit college', 'Which university is Sujit studying at', 'Where is he doing his B.Tech', 'Is Sujit a student', 'Sujit institute name', 'Is he from GIET'],
  'Sujit studies **Computer Science (B.Tech)** at **GIET University, Gunupur, Odisha**, from **July 2024 to July 2028 (expected)**.', ['Education']);
e('degree', 'education', ['What degree is Sujit pursuing?', 'What is Sujit qualification?', 'What is his branch?', 'What is Sujit studying', 'What course is Sujit doing', 'Which stream is he in', 'Is Sujit doing engineering', 'What is his major'],
  'He is pursuing a **Bachelor of Technology (B.Tech) in Computer Science** at GIET University. His public profile highlights a focus on cybersecurity and AI engineering.', ['Education']);
e('graduation', 'education', ['When will Sujit graduate?', 'When does Sujit finish his degree?', 'What is his graduation year', 'In which year will he complete B.Tech', 'Which year is Sujit in', 'What year of college is Sujit in', 'Which semester is he in', 'Batch of Sujit'],
  'His B.Tech runs from **July 2024 to July 2028 (expected)**, so his expected graduation is **2028**. Which semester he is in right now is not listed.', ['Education']);
e('school', 'education', ['Where did Sujit study before college?', 'Which school did Sujit attend?', 'What is Sujit school name?', 'Where did he do his 12th', 'What is his schooling', 'Sujit senior secondary school', 'Where did Sujit do his higher secondary', 'What board did he study under'],
  'He completed senior secondary education at **Seven Hills Residential School, Odisha (July 2012 – July 2024)**. The exam board and marks are not on file.', ['Education']);
e('education-all', 'education', ['Tell me about Sujit education', 'What is Sujit educational background?', 'Sujit academic history', 'Give me his education details', 'What are his qualifications'],
  '- **B.Tech in Computer Science**, GIET University, Gunupur (July 2024 – July 2028, expected)\n- **Senior Secondary**, Seven Hills Residential School, Odisha (July 2012 – July 2024)\n\nGrades are not on file.', ['Education']);

/* ───────────── Experience ───────────── */
e('experience-all', 'experience', ['What is Sujit work experience?', 'Where has Sujit worked?', 'Tell me about Sujit internships', 'How many internships has Sujit done?', 'List all his internships', 'What companies has Sujit worked for', 'Does Sujit have any experience', 'Has Sujit done any internship', 'Sujit professional experience', 'What is his work history', 'Does Sujit have industry experience'],
  'Sujit has completed **5 internships** and founded a startup:\n1. **Web Developer**, Mahanadi Coalfields Ltd (June 2026, on-site, Sambalpur)\n2. **Prompt Engineer**, EduSkills Foundation (Apr–Jun 2026, remote)\n3. **Python Developer**, EduSkills Foundation (Jan–Mar 2026, remote)\n4. **Cyber Security Intern**, PreppRight EdTech (Jun–Jul 2025, New Delhi, remote)\n5. **AI/ML Intern**, CTTC, MSME, Government of India (May–Jun 2025, Bhubaneswar)\n\nAlso: **Founder**, NivaraNova Technologies Pvt Ltd (Gunupur, Odisha).', ['Work Experience']);
e('latest-internship', 'experience', ['What is Sujit latest internship?', 'What is Sujit most recent job?', 'Where is Sujit working now?', 'What is Sujit current role', 'Where does Sujit work currently', 'Is Sujit employed', 'What is he doing currently', 'Does Sujit have a job right now'],
  'His most recent internship is **Web Developer at Mahanadi Coalfields Ltd (MCL), June 2026**. Beyond internships, he is the **founder of NivaraNova Technologies Pvt Ltd** and a B.Tech student at GIET University. A full-time job is not listed on his profile.', ['Work Experience']);
e('mcl', 'experience', ['What did Sujit do at MCL?', 'Tell me about Sujit internship at Mahanadi Coalfields', 'What was his role at MCL?', 'Where did Sujit intern in Sambalpur', 'Sujit MCL web developer internship', 'What did he build at Mahanadi Coalfields', 'How long was the MCL internship', 'Which department did Sujit work in at MCL', 'Coal India internship of Sujit', 'Was the MCL internship on-site'],
  '**Web Developer Intern, Mahanadi Coalfields Ltd (MCL)** (a subsidiary of Coal India Ltd), **June 2026, 1 month, on-site in Sambalpur**, System Dept., MCL HQ.\n\n- Built responsive web applications, operational data portals and software tools for industrial workflows\n- Implemented scalable frontend layouts, secure backend API integrations and robust database systems\n- Skills: web development, full-stack development, industrial systems, database systems\n\nHe received an MCL Internship Certificate.', ['Work Experience']);
e('prompt-eng', 'experience', ['What did Sujit do at EduSkills prompt engineering?', 'Tell me about Sujit Prompt Engineering internship', 'What is Sujit prompt engineer role', 'Does Sujit know prompt engineering', 'What did Sujit learn about LLMs', 'What generative AI experience does Sujit have', 'Has Sujit worked with large language models', 'Tell me about the AICTE prompt engineering internship', 'What is context engineering', 'Does Sujit know generative AI'],
  '**Prompt Engineer, EduSkills Foundation** (with AICTE and the Ministry of Education), **April–June 2026, remote**. He completed the 10-week **Prompt Engineering for AI** virtual internship and gained hands-on exposure to **Generative AI, Large Language Models (LLMs), prompt optimization, context engineering and AI-driven problem solving**.', ['Work Experience']);
e('python-intern', 'experience', ['What did Sujit do in the EduSkills Python internship?', 'Tell me about Sujit Python Full Stack internship', 'Did Sujit build an in-memory cache', 'What did Sujit build during the Python internship', 'What is the Python Developer internship', 'Where did Sujit learn FastAPI', 'Did Sujit learn React in an internship', 'When was the Python Full Stack internship', 'What was the National Internship Portal internship'],
  '**Python Developer, EduSkills Foundation** (under AICTE and the National Internship Portal), **January–March 2026, remote**. He completed the 10-week **Python Full Stack Development** virtual internship: **FastAPI, REST API development, database integration, authentication and React basics**, and built and deployed full-stack projects including an **in-memory cache with TTL**.', ['Work Experience']);
e('cyber-intern', 'experience', ['What did Sujit do at PreppRight?', 'Tell me about Sujit cybersecurity internship', 'What is Sujit cyber security experience', 'Where did Sujit learn ethical hacking', 'Has Sujit done a cybersecurity internship', 'What did Sujit learn in the PreppRight internship', 'PreppRight EdTech internship details', 'Does Sujit have penetration testing experience', 'What security training does Sujit have', 'When was the cybersecurity internship'],
  '**Cyber Security Intern, PreppRight EdTech Pvt. Ltd.**, **June–July 2025 (2 months), New Delhi, remote**. He completed Cyber Security training covering **network security, ethical hacking fundamentals, vulnerability assessment and basic penetration testing**, and worked with tools and techniques for threat analysis, risk mitigation and securing systems against cyber attacks. He holds a Cyber Security Training Certificate.', ['Work Experience', 'Cybersecurity Skills']);
e('cttc', 'experience', ['What did Sujit do at CTTC?', 'Tell me about Sujit AI ML internship', 'What is Sujit machine learning experience', 'Where did Sujit do his AI/ML internship', 'What did Sujit learn at Central Tool Room', 'Which ML algorithms has Sujit implemented', 'Has Sujit used scikit-learn', 'Did Sujit work with MSME', 'AI internship of Sujit in Bhubaneswar', 'Does Sujit know decision trees', 'Does Sujit know KNN', 'Has Sujit built a regression model'],
  '**AI/ML Intern, Central Tool Room & Training Centre (CTTC, MSME, Government of India)**, **May–June 2025 (2 months), Bhubaneswar, on-site**.\n\n- Data preprocessing, feature engineering and model building\n- Algorithms: **Linear Regression, Decision Trees, KNN**\n- Evaluated models with accuracy metrics and a confusion matrix on real-world datasets\n- Tools: Python, NumPy, Pandas, Matplotlib, Scikit-learn\n\nHe received an AI/ML Training Certificate from CTTC.', ['Work Experience', 'AI Capabilities']);
e('founder', 'experience', ['Is Sujit a founder?', 'Does Sujit have a startup?', 'What is NivaraNova?', 'Tell me about NivaraNova Technologies', 'Which company does Sujit own?', 'Did Sujit start a company?', 'Is Sujit an entrepreneur', 'What is Sujit startup', 'Who founded NivaraNova', 'What does NivaraNova do', 'What is NivaraNova Technologies Pvt Ltd', 'Does Sujit run a company', 'Is Sujit a CEO', 'What is Sujit doing apart from studies', 'Tell me about Sujit entrepreneurship'],
  `Yes. Sujit is the **Founder of NivaraNova Technologies Pvt Ltd**, an early-stage technology company from **Gunupur, Odisha**. It builds practical software for problems in public services, starting with **CivicSetu**, a civic engagement and grievance redressal platform. Website: ${L.nivaranova}\n\nFounding dates, team size and funding are not on file.`, ['Work Experience', 'CivicSetu']);
e('founder-details', 'experience', ['When was NivaraNova founded?', 'How many employees does NivaraNova have?', 'How much funding does NivaraNova have?', 'What is NivaraNova revenue?', 'Who are the co-founders of NivaraNova', 'Does NivaraNova have investors', 'What is the valuation of NivaraNova', 'How many users does CivicSetu have', 'Is CivicSetu live', 'Is NivaraNova registered', 'Is CivicSetu launched'],
  'NivaraNova describes itself as **early-stage**. Its founding date, team size, funding, revenue, customers and CivicSetu\'s user numbers are **not on file**, so I can\'t share them. ' + ASK_HIM + `\n\nWebsite: ${L.nivaranova}`, ['Work Experience']);
e('internship-count', 'experience', ['How many internships has Sujit completed?', 'How many internships does Sujit have', 'Number of internships by Sujit', 'How many companies has Sujit interned at'],
  'Sujit has completed **5 internships**: MCL (Web Developer), EduSkills (Prompt Engineer), EduSkills (Python Developer), PreppRight (Cyber Security) and CTTC (AI/ML).', ['Work Experience']);
e('fulltime', 'experience', ['Does Sujit have full-time work experience?', 'How many years of experience does Sujit have?', 'Has Sujit worked full time', 'What is Sujit total experience', 'Is Sujit a fresher', 'Is Sujit experienced or a fresher', 'How many years of experience'],
  'Sujit is a B.Tech student (graduating 2028). His professional experience is **5 internships (2025–2026)** plus founding NivaraNova. No full-time employment is listed, so by years of employment he would count as a student or fresher with hands-on internship and project experience.', ['Work Experience', 'Education']);

/* ───────────── Certificates ───────────── */
e('certs', 'achievements', ['What certifications does Sujit have?', 'List Sujit certificates', 'How many certifications does Sujit hold?', 'What credentials does Sujit have', 'Does Sujit have certificates', 'Show me his certifications', 'Where can I verify his certificates', 'Are Sujit certificates verified', 'Sujit certification list', 'Which courses has Sujit completed'],
  `Sujit lists **10 certifications**, verifiable on [LinkedIn](${L.certs}):\n\n**Internship certificates**\n1. MCL Web Developer Internship, Mahanadi Coalfields Ltd\n2. AI Prompt Engineering Virtual Internship, EduSkills & AICTE\n3. Python Full Stack Internship, EduSkills, AICTE & National Internship Portal\n4. Cyber Security Training, PreppRight EdTech\n5. AI/ML Training, CTTC (MSME, Government of India)\n\n**Other certifications**\n6. Cisco (networking fundamentals)\n7. HP LIFE (business and technology skills)\n8. Let's Upgrade ChatGPT (AI and ChatGPT applications)\n9. Coding Ninjas (programming and data structures)\n10. GIET University coursework certification`, ['Certifications']);
e('cert-cisco', 'achievements', ['Does Sujit have a Cisco certification?', 'Is Sujit Cisco certified?', 'What Cisco course did Sujit do', 'Does Sujit know networking', 'Does Sujit have a CCNA'],
  'Yes. Sujit lists a **Cisco certification** (networking fundamentals), verifiable on LinkedIn. A CCNA or other specific Cisco exam is not on file.', ['Certifications']);
e('cert-other', 'achievements', ['Does Sujit have an AWS certification?', 'Is Sujit AWS certified?', 'Does Sujit have a Google certification', 'Does Sujit have a CEH certification', 'Does Sujit have Security+ certificate', 'Is Sujit Microsoft certified', 'Does he have an Oracle certification', 'Does Sujit have a Red Hat certificate', 'Is Sujit CISSP certified', 'Does he hold an OSCP'],
  'None of those is on file. Sujit\'s listed certifications are the 5 internship certificates plus Cisco, HP LIFE, Let\'s Upgrade ChatGPT, Coding Ninjas and a GIET coursework certification. See the Certificates section or [LinkedIn](' + L.certs + ').', ['Certifications']);

/* ───────────── Goals and the long view ───────────── */
e('goals', 'goals', ['What are Sujit goals?', 'What is Sujit career goal?', 'What does Sujit want to become?', 'What are his career plans', 'What is Sujit ambition', 'What does Sujit want to do in future', 'What is his dream job', 'Where does Sujit see himself', 'What is Sujit aiming for', 'What are his aspirations'],
  'Sujit is pursuing a career at the intersection of **cybersecurity, AI engineering and full-stack development**, and he is building a company (NivaraNova Technologies) around practical public-service software. He is currently exploring cloud infrastructure (AWS, Docker), advanced penetration testing, secure backend architecture, AI/ML in real-world systems and modern frontend engineering.\n\nA detailed personal roadmap is not published; for that, ask him directly.', ['Goals & Aspirations']);
e('ten-years', 'goals', ['Where will Sujit be in 10 years?', 'What will Sujit do in the next 20 years?', 'What is Sujit 10 year plan?', 'What is Sujit 5 year plan', 'What is his long term vision', 'Will Sujit become a CEO', 'What will Sujit be in 2035', 'What does Sujit want in the next decade', 'What will Sujit achieve in 20 years', 'Sujit future plans for the coming years', 'Where does Sujit see himself in five years', 'What will Sujit be doing in 2030', 'Will Sujit be rich', 'Will Sujit be successful'],
  'Sujit hasn\'t published a 5, 10 or 20-year plan, and I won\'t predict his future. What **is** on file:\n\n- He is a B.Tech student finishing in 2028\n- He already **founded NivaraNova Technologies** to build public-service software\n- His stated direction is cybersecurity, AI engineering and full-stack development\n- He is actively learning cloud, penetration testing and secure architecture\n\nBecause I read his live GitHub activity, I will keep reflecting what he builds over the years. For his long-term vision, ask him at **' + EMAIL + '**.', ['Goals & Aspirations', 'Work Experience']);
e('learning', 'goals', ['What is Sujit learning now?', 'What is Sujit currently exploring?', 'What technologies is Sujit learning', 'What does Sujit want to learn next', 'What is Sujit studying apart from college', 'What are his learning goals', 'What is Sujit roadmap'],
  'Currently exploring: the intersection of cybersecurity and scalable engineering, AI/ML in real-world systems, cloud infrastructure (AWS, Docker), advanced penetration testing and secure backend architecture, and modern frontend and UX design. For what he is building this week, ask me "What did Sujit commit recently?".', ['Goals & Aspirations']);
e('why-hire', 'goals', ['Why should I hire Sujit?', 'Why should a company hire Sujit', 'Is Sujit a good developer?', 'Is Sujit good at coding', 'How good is Sujit', 'Would Sujit be a good fit for my team', 'What value can Sujit add', 'Is Sujit a good engineer', 'Should I recruit Sujit'],
  'On the record: **5 internships** across web, Python, AI/ML, prompt engineering and cybersecurity; **10+ shipped projects** with real REST APIs, databases and deployments; a security-first approach (threat modeling, input validation, OWASP); a public GitHub contribution history (live numbers are in the GitHub Activity section); and the initiative to found **NivaraNova Technologies**. See his projects and GitHub for the evidence, or contact him at **' + EMAIL + '**.', ['Developer Profile', 'Work Experience']);
e('weakness', 'goals', ['What are Sujit weaknesses?', 'What is Sujit weakness?', 'What can Sujit improve', 'What are his drawbacks', 'What does Sujit lack', 'What is his biggest mistake', 'What are Sujit limitations'],
  'Sujit has not published a list of weaknesses and I won\'t invent one. Honest context from his record: he is still a student (graduating 2028), his professional experience is internship-based, and he is actively learning cloud and advanced penetration testing.', ['Developer Profile']);

/* ───────────── Skills: group-level answers (per-technology answers are generated below) ───────────── */
e('skills-all', 'skills', ['What are Sujit skills?', 'What technologies does Sujit know?', 'What is Sujit tech stack?', 'List his technical skills', 'What programming languages does Sujit know', 'What can Sujit build', 'What are Sujit strongest technical skills', 'What technologies does Sujit work with', 'Tell me about Sujit expertise', 'Which languages does Sujit code in', 'What is Sujit skill set'],
  '- **Frontend**: HTML5, CSS3, JavaScript, React\n- **Backend**: Python, Node.js, Express, FastAPI, Java, Django\n- **Databases**: PostgreSQL, MongoDB, MySQL\n- **AI/ML**: NumPy, Pandas, Scikit-learn, Matplotlib, MediaPipe\n- **Cybersecurity**: penetration testing, cryptography, OWASP, network security, ethical hacking\n- **DevOps and tools**: Git, GitHub, Docker, Linux, AWS, VS Code', ['Resume Summary']);
e('best-language', 'skills', ['What is Sujit best programming language?', 'Which language does Sujit use the most?', 'What is Sujit primary language', 'Which is his strongest language', 'What does Sujit mainly code in', 'Python or JavaScript which does Sujit prefer'],
  '**Python** is described as his primary language (AI/ML projects, FastAPI and Django backends, data analysis, automation), and **JavaScript** powers his full-stack and portfolio work. He has not ranked a single "best" language. Ask me about his GitHub languages for the live mix.', ['Programming Languages']);
e('frontend', 'skills', ['Is Sujit a frontend developer?', 'Does Sujit do frontend?', 'What frontend skills does Sujit have', 'Is Sujit a full stack developer', 'Is Sujit a backend developer', 'Does Sujit know full stack development', 'What is Sujit frontend stack'],
  'Sujit is a **full-stack developer**. Frontend: HTML5, CSS3, JavaScript and React (semantic HTML, accessibility, responsive design, GSAP animation). Backend: Node.js, Express, FastAPI, Django and Java, with PostgreSQL, MongoDB and MySQL. See Finn-Track-Pro and CivicSetu for end-to-end examples.', ['Web Development Skills']);
e('devops', 'skills', ['Does Sujit know DevOps?', 'Does Sujit know Docker?', 'What cloud platforms does Sujit use', 'Where does Sujit deploy projects', 'Does Sujit know cloud computing', 'How does Sujit host his apps', 'Does he use CI/CD'],
  'His listed DevOps and tools: **Git, GitHub, Docker, Linux and AWS**. In practice his projects are deployed on **Vercel** (this portfolio, Finn-Track-Pro, NivaraNova\'s site) and **Render**, with PostgreSQL hosted on **Neon**. Cloud and Docker are also on his current learning list.', ['Web Development Skills', 'Programming Languages']);
e('tools', 'skills', ['What tools does Sujit use?', 'What IDE does Sujit use?', 'What operating system does Sujit use', 'Which editor does Sujit use', 'Does Sujit use VS Code', 'Does Sujit use Linux'],
  'Tools on file: **VS Code** (primary editor), **Git and GitHub**, **Linux**, **Docker**, and AWS. Which operating system he uses day to day is not specified.', ['Web Development Skills']);
e('ai-skills', 'skills', ['What are Sujit AI skills?', 'Does Sujit know machine learning?', 'What is Sujit AI experience', 'Does Sujit do AI engineering', 'What ML libraries does Sujit use', 'Does Sujit know computer vision', 'Does Sujit know deep learning', 'Has Sujit worked with YOLO', 'Does Sujit know OpenCV', 'Does Sujit know TensorFlow', 'Does Sujit know PyTorch'],
  'AI/ML on file: **NumPy, Pandas, Scikit-learn, Matplotlib, MediaPipe**, regression, decision trees and KNN (CTTC internship), **YOLOv8 computer vision** in BullLens, **MediaPipe hand tracking** in Superpower Hands, and prompt engineering with LLMs. TensorFlow and PyTorch are not listed on his résumé.', ['AI Capabilities']);
e('security-skills', 'skills', ['What are Sujit cybersecurity skills?', 'Does Sujit know cybersecurity?', 'Does Sujit know penetration testing?', 'Is Sujit an ethical hacker', 'Does Sujit know cryptography', 'Does Sujit know OWASP', 'Does Sujit know network security', 'What security tools does Sujit use', 'Does Sujit know Kali Linux', 'Does Sujit know Wireshark', 'Does Sujit know Nmap', 'Does Sujit know Burp Suite'],
  'Cybersecurity on file: **penetration testing, cryptography, OWASP Top 10, network security, ethical hacking and vulnerability assessment**, from his PreppRight internship, CTFs and security-first projects. Specific tools such as Kali, Wireshark, Nmap or Burp Suite are not individually listed on his résumé.', ['Cybersecurity Skills']);
e('db-skills', 'skills', ['What databases does Sujit know?', 'Does Sujit know SQL?', 'Does Sujit know NoSQL', 'Which database does Sujit prefer', 'Has Sujit worked with databases', 'Does Sujit know database design', 'Which databases has Sujit used'],
  '**PostgreSQL** (Finn-Track-Pro, hosted on Neon), **MySQL** (BullLens, CivicSetu) and **MongoDB** (document-based apps). He has also worked on database design in the Java Bank and Hotel Management systems.', ['Programming Languages']);

/* ───────────── Projects: group-level answers ───────────── */
e('projects-all', 'projects', ['What projects has Sujit built?', 'Show me Sujit projects', 'List all his projects', 'What has Sujit developed?', 'How many projects has Sujit made', 'Tell me about his work', 'What are his best projects', 'What is Sujit featured work', 'What applications has Sujit made', 'Tell me about Sujit portfolio projects', 'Which project is Sujit most proud of'],
  '**Featured projects**\n1. **CivicSetu**: civic engagement and grievance platform (NivaraNova Technologies)\n2. **Finn-Track-Pro**: full-stack finance tracker (PostgreSQL, REST API)\n3. **BullLens**: stock market predictor (FastAPI, YOLOv8, MySQL)\n4. **Superpower Hands**: real-time hand tracking (MediaPipe)\n5. **Weather Dashboard**: real-time weather app\n6. **Bank Management System** and **Hotel Management System** (Java)\n7. **Learning Management System**\n8. **IPL Analytics Crunch-26**: Python analytics package\n9. **Bandwidth-Agnostic PWA**: offline-first web app\n10. **VoteWise**: voting application\n\nAsk about any of them by name. His repositories are on [GitHub](' + L.github + ').', ['Projects']);
e('ai-projects', 'projects', ['What AI projects has Sujit built?', 'Which projects use machine learning?', 'Does Sujit have any computer vision project', 'Which project uses AI', 'What are his AI/ML projects', 'Which projects use Python'],
  '- **BullLens**: stock market predictor with FastAPI and YOLOv8 chart-pattern recognition\n- **Superpower Hands**: real-time hand tracking with MediaPipe and OpenCV\n- **IPL Analytics Crunch-26**: Python and Pandas data analysis package\n\nAsk about any of them for details.', ['BullLens', 'Superpower Hands', 'IPL Analytics']);
e('web-projects', 'projects', ['Which web projects has Sujit built?', 'What full stack projects does Sujit have', 'Which project has a REST API', 'Which projects are deployed live', 'Which project did Sujit deploy on Vercel', 'What is Sujit biggest project', 'What is Sujit most complex project'],
  'Web and full-stack work: **Finn-Track-Pro** (PostgreSQL, REST API, Vercel and Render), **CivicSetu** (Django REST Framework and React), **Weather Dashboard**, **Learning Management System**, **VoteWise**, the **Bandwidth-Agnostic PWA** and this portfolio. Which one is "biggest" is his call; CivicSetu and Finn-Track-Pro are the most complete full-stack builds on file.', ['Projects']);
e('java-projects', 'projects', ['Which projects use Java?', 'Does Sujit have Java projects?', 'What Java applications did Sujit make', 'Has Sujit built an OOP project'],
  'His Java projects are the **Bank Management System** and the **Hotel Management System**. Ask about either for details.', ['Bank Management System', 'Hotel Management System']);
e('open-source', 'projects', ['Is Sujit open source?', 'Are his projects open source?', 'Are his repositories public', 'Does Sujit contribute to open source', 'Are Sujit repos public', 'Can I see the source code of his projects'],
  `His repositories are public on GitHub (${L.github}). Whether they carry open-source licenses, or whether he contributes to other people's projects, is not on file.`, ['Projects']);
e('live-demo', 'projects', ['Do Sujit projects have live demos?', 'Where can I try his projects?', 'Are his apps deployed', 'Give me a live link of his projects', 'Is there a demo for Finn-Track-Pro', 'Can I see a demo of his project'],
  'Live deployments are not listed for every project, and I won\'t invent links. What is on file: this portfolio and the NivaraNova site (' + L.nivaranova + ') are live on Vercel, and Finn-Track-Pro is deployed on Vercel and Render. Source code for every project is on [GitHub](' + L.github + ').', ['Projects']);

/* ───────────── More ways people ask the same things ───────────── */
const more = (id, phrasings) => { const x = entries.find((en) => en.id === id); if (x) x.q.push(...phrasings); };

e('personal-other', 'private', [
  'What is his biggest fear?', 'Does he have a car?', 'What is his net worth?', 'What is his blood group?', 'Does he smoke?', 'Does he drink?',
  'Does he have pets?', 'What is his favourite place to travel?', 'What is his daily routine?', 'What time does he wake up?', 'What does he eat?',
  'Is he vegetarian?', 'What is his Aadhaar number?', 'What is his PAN number?', 'Does he have a driving licence?', 'What is his bank account?',
  'What does he do on weekends?', 'What is his biggest regret?', 'Does he have a bike?', 'What is his fitness routine?', 'How much does he weigh?',
  'What is his skin colour?', 'Who are his friends?', 'Who is his best friend?', 'What is his mother tongue?', 'What are his dreams at night?',
], NOT_ON_FILE('personal or private details like this'));

more('who', ['Tell me something about this guy', 'Tell me about this person', 'Who exactly is Sujit Kumar Sahu', 'Introduce him to me', 'What should I know about Sujit', 'Give me a quick summary of Sujit']);
more('title', ['What kind of person is he professionally', 'What kind of engineer is he', 'What does he do for a living', 'What is Sujit doing in his career']);
more('hobbies', ['What does he like doing outside of work?', 'What does he do for fun?', 'What are his hobbies and pastimes?', 'How does he relax?', 'What does he enjoy besides programming?']);
more('status', ['Can I hire him for a freelance gig?', 'Is he free to take new projects?', 'Is he taking on new work?', 'Can I offer him a job?', 'Does he accept freelance projects?', 'Is he looking for opportunities?']);
more('university', ['Which uni is he enrolled in?', 'Which institution is he enrolled in?', 'Where is he enrolled?', 'In which college is he studying?']);
more('school', ['Where did he finish high school?', 'Which high school did he go to?', 'Where did he study till 12th?', 'What was his school?']);
more('learning', ['What is he learning at the moment?', 'What is he studying right now?', 'What is he working to learn these days?', 'What new skills is he picking up?']);
more('goals', ['What are his dreams for the future?', 'What does he hope to achieve?', 'What does he want to achieve in life?', 'What is his purpose in tech?']);
more('frontend', ['Is he a full stack dev?', 'Is he a fullstack engineer?', 'Is he a web developer?', 'Does he build websites?']);
more('security-skills', ['Can he do penetration testing?', 'Can he hack ethically?', 'Is he good at security?', 'How strong is his cybersecurity knowledge?']);
more('cttc', ['What happened at the CTTC training?', 'What did he learn at CTTC?', 'Tell me about the CTTC internship']);
more('sujit-ai', ['What is this chatbot?', 'What is this assistant?', 'What is this bot?', 'Who am I talking to?', 'Can you answer questions about Sujit?', 'Are you an AI assistant?']);
more('experience-all', ['Has he got any internship experience?', 'Does he have any work experience?', 'Has he worked anywhere?']);
more('why-hire', ['Why is he a good hire?', 'What makes him a good candidate?', 'Is he worth hiring?']);
more('skills-all', ['What are his main skills?', 'What is he good at technically?', 'What is his core tech stack?']);


/* ───────────── Fallback: the original 30 FAQ pairs are added by buildBank() ───────────── */

/* ═════════════ Generators ═════════════ */

const PROJECT_ALIASES = {
  bulllens: ['BullLens', 'Bull Lens', 'stock predictor', 'stock market predictor', 'smart stock tracker'],
  'finn-track-pro': ['Finn Track Pro', 'FinnTrack', 'finance tracker', 'expense tracker', 'personal finance app'],
  'superpower-hands': ['Superpower Hands', 'hand tracking project', 'gesture recognition app', 'hand gesture project'],
  'bandwidth-agnostic-pwa': ['Bandwidth Agnostic PWA', 'offline PWA', 'low bandwidth PWA', 'progressive web app project'],
  votewise: ['VoteWise', 'Vote Wise', 'voting app', 'voting system project'],
  'ipl-analytics': ['IPL Analytics', 'IPL Crunch', 'IPL project', 'cricket analytics project'],
  'weather-dashboard': ['Weather Dashboard', 'weather app', 'weather project'],
  'bank-management': ['Bank Management System', 'banking system project', 'bank project'],
  'hotel-management': ['Hotel Management System', 'hotel project', 'hotel booking system'],
  lms: ['Learning Management System', 'LMS', 'LMS project'],
  civicsetu: ['CivicSetu', 'Civic Setu', 'civic engagement platform', 'civic grievance platform'],
};

function readFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const meta = {};
  let body = raw;
  if (m) {
    body = raw.slice(m[0].length).trim();
    for (const line of m[1].split(/\r?\n/)) {
      const i = line.indexOf(':');
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
    }
  }
  return { meta, body };
}

function sections(body) {
  const out = {};
  const re = /^##\s+(.+?)\s*$/gm;
  let m, last = null, lastIdx = 0;
  while ((m = re.exec(body)) !== null) {
    if (last) out[last] = body.slice(lastIdx, m.index).trim();
    last = m[1].toLowerCase();
    lastIdx = m.index + m[0].length;
  }
  if (last) out[last] = body.slice(lastIdx).trim();
  return out;
}

function readDir(dir) {
  const full = path.join(KNOWLEDGE_DIR, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter((f) => f.endsWith('.md')).map((f) => ({ file: f, raw: fs.readFileSync(path.join(full, f), 'utf-8') }));
}

const projectNameMap = {};

function generateProjectEntries() {
  const out = [];
  for (const { file, raw } of readDir('projects')) {
    const base = path.basename(file, '.md');
    const { meta, body } = readFrontmatter(raw);
    const sec = sections(body);
    const title = meta.title || base;
    const aliases = [...new Set([title, ...(PROJECT_ALIASES[base] || []), base.replace(/-/g, ' ')])];
    const names = aliases.slice(0, 4);
    projectNameMap[base] = aliases;
    const tech = meta.technologies ? meta.technologies.replace(/^\[|\]$/g, '') : '';
    const gh = meta.github || '';
    const src = [title];
    const add = (suffix, qs, a) => { if (a) out.push({ id: `project-${base}-${suffix}`, topic: 'projects', q: qs, a, src }); };

    add('overview', names.flatMap((n) => [`What is ${n}?`, `Tell me about ${n}`, `Explain ${n}`, `Describe the ${n} project`, `What does ${n} do?`, `Give me an overview of ${n}`]),
      `**${title}**: ${sec.solution || sec.problem || ''}${tech ? `\n\n**Technologies**: ${tech}` : ''}${gh ? `\n\n**Source**: ${gh}` : ''}`);
    add('problem', names.flatMap((n) => [`What problem does ${n} solve?`, `Why did Sujit build ${n}?`, `What is the purpose of ${n}?`, `What is the motivation behind ${n}`]), sec.problem && `**${title}**, the problem it addresses: ${sec.problem}`);
    add('features', names.flatMap((n) => [`What are the key features of ${n}?`, `What features does ${n} have?`, `What can ${n} do`, `List ${n} features`]), sec['key features'] && `**${title}**, key features:\n${sec['key features']}`);
    add('tech', names.flatMap((n) => [`What technologies does ${n} use?`, `What is the tech stack of ${n}?`, `Which language is ${n} built with?`, `What is ${n} built with`, `Which framework does ${n} use`, `What database does ${n} use`]),
      tech && `**${title}** is built with: ${tech}.`);
    add('role', names.flatMap((n) => [`What was Sujit role in ${n}?`, `What did Sujit do in ${n}?`, `Who built ${n}?`, `Did Sujit build ${n} alone`, `What did Sujit contribute to ${n}`]), sec["sujit's role"] && `**${title}**, Sujit's role: ${sec["sujit's role"]}`);
    add('arch', names.flatMap((n) => [`What is the architecture of ${n}?`, `How is ${n} designed?`, `How does ${n} work?`, `Explain how ${n} works`]), sec.architecture && `**${title}**, architecture:\n${sec.architecture}`);
    add('source', names.flatMap((n) => [`GitHub link of ${n}`, `Where is the source code of ${n}?`, `Repo of ${n}`, `Where can I see ${n} code`, `Is ${n} on GitHub`, `Link to ${n}`]), gh && `**${title}** source code: ${gh}`);
  }
  return out;
}

/** Parse the résumé's "Technical Skills" list into { tech, category } pairs. */
function resumeSkills() {
  const doc = readDir('resume')[0];
  if (!doc) return [];
  const m = doc.raw.match(/## Technical Skills([\s\S]*?)(?=\n## |$)/);
  if (!m) return [];
  const out = [];
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^-\s+\*\*(.+?)\*\*:\s*(.+)$/);
    if (!mm) continue;
    for (const t of mm[2].split(',').map((x) => x.trim()).filter(Boolean)) out.push({ tech: t, category: mm[1] });
  }
  return out;
}

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9+#]/g, '');

function usageOf(tech) {
  const t = norm(tech);
  const projects = [];
  for (const { file, raw } of readDir('projects')) {
    const { meta, body } = readFrontmatter(raw);
    const techs = (meta.technologies || '').replace(/^\[|\]$/g, '').split(',').map(norm);
    if (techs.includes(t) || norm(body).includes(t)) projects.push(meta.title || path.basename(file, '.md'));
  }
  const exp = readDir('experience')[0];
  const jobs = [];
  if (exp) {
    for (const block of exp.raw.split(/\n## /).slice(1)) {
      const head = block.split('\n')[0].replace(/^\d+\.\s*/, '');
      if (norm(block).includes(t)) jobs.push(head);
    }
  }
  return { projects: [...new Set(projects)], jobs };
}

const SKILL_ALIASES = { 'HTML5': ['HTML'], 'CSS3': ['CSS'], 'Node.js': ['NodeJS', 'Node'], 'Express': ['Express.js', 'ExpressJS'], 'Scikit-learn': ['sklearn', 'scikit learn'], 'Pen Testing': ['penetration testing', 'pentesting'], 'PostgreSQL': ['Postgres'], 'MongoDB': ['Mongo'], 'JavaScript': ['JS'], 'Network Security': ['networking security'], 'Ethical Hacking': ['hacking'], 'OWASP': ['OWASP Top 10'] };

function generateSkillEntries() {
  const out = [];
  for (const { tech, category } of resumeSkills()) {
    const names = [tech, ...(SKILL_ALIASES[tech] || [])];
    const use = usageOf(tech);
    let a = `Yes. **${tech}** is listed among Sujit's **${category}** skills on his résumé.`;
    if (use.projects.length) a += `\n\n**Used in projects**: ${use.projects.join(', ')}.`;
    if (use.jobs.length) a += `\n\n**Appears in experience**: ${use.jobs.join('; ')}.`;
    out.push({
      id: `skill-${norm(tech)}`, topic: 'skills', src: ['Resume Summary'], a,
      q: names.flatMap((n) => [`Does Sujit know ${n}?`, `Is Sujit good at ${n}?`, `Has Sujit used ${n}?`, `What is Sujit experience with ${n}?`, `Can Sujit work with ${n}`, `Does he have ${n} skills`, `Is ${n} part of Sujit's tech stack`]),
    });
  }
  return out;
}

/** The original 30 curated FAQ pairs stay as entries, verbatim. */
function generateFaqEntries() {
  const out = [];
  const doc = readDir('faq').find((d) => d.file === 'qa-knowledge.md');
  if (!doc) return out;
  const re = /### Q(\d+):\s*([^\n\r]+)\r?\n([\s\S]*?)(?=(?:### Q\d+:|$))/g;
  let m;
  while ((m = re.exec(doc.raw)) !== null) {
    out.push({ id: `faq-${m[1]}`, topic: 'faq', q: [m[2].trim()], a: m[3].trim(), src: ['Frequently Asked Questions'] });
  }
  return out;
}

let bankCache = null;
function buildBank() {
  if (bankCache) return bankCache;
  const bank = [...entries, ...generateProjectEntries(), ...generateSkillEntries(), ...generateFaqEntries()];
  const seen = new Set();
  bankCache = bank.filter((x) => x.a && !seen.has(x.id) && seen.add(x.id));
  return bankCache;
}

/** project file name -> every name people use for it (valid after buildBank()) */
function getProjectNames() { buildBank(); return projectNameMap; }

module.exports = { buildBank, getProjectNames, ASK_HIM, EMAIL, L };
