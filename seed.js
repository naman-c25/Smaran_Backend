const https = require('https');

// ─── CONFIG ───────────────────────────────────────────────
const BASE_URL = 'https://smaranbackend-production.up.railway.app';
const EMAIL    = 'naman@smaran.test';
const PASSWORD = 'naman1234';
const DELAY_MS = 800;
// ──────────────────────────────────────────────────────────

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function randomDate(yearsAgo, yearsAgoEnd = yearsAgo - 1) {
  const now = Date.now();
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  const start = now - yearsAgo * msPerYear;
  const end   = now - yearsAgoEnd * msPerYear;
  return new Date(start + Math.random() * (end - start)).toISOString();
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ─── ALL 1000 MEMORIES ────────────────────────────────────
function getAllMemories() {
  return [

    // ── YEAR 3 AGO (1st year college) ─────────────────────

    { text: "Aaj college ka pehla din tha. Bahut nervous tha subah se, naya campus, nayi jagah, koi jaanta nahi tha. Orientation hall mein baitha tha toh ek ladke ne hi baat shuru ki — uska naam Rahul tha. Hum dono canteen mein saath gaye baad mein, chai pi aur ghanton baatein ki. Achha laga, lagta hai yahan dost ban sakte hain.", recordedAt: randomDate(3, 2.9), durationSeconds: rand(80,140) },

    { text: "Pehla coding lab session tha aaj college mein. Professor ne C++ basics se shuru karaya. Mujhe thodi knowledge thi pehle se toh concepts samajh aa gaye lekin baaki students ke liye mushkil tha. Rahul mere saath baitha tha, usse pointers samajh nahi aa rahe the toh maine help ki. Lab ke baad hum dono library gaye aur ek ghanta aur practice ki saath mein.", recordedAt: randomDate(3, 2.9), durationSeconds: rand(90,150) },

    { text: "Aaj pehli baar hostel mein akela feel kiya. Ghar ki yaad aayi bahut zyada, maa ke haath ka khana miss kiya. Raat ko Rahul ne knock kiya mera room, bola chalo rooftop pe baithte hain. Wahan gaye toh aur 4-5 log the, sab first year ke. Sab ki same situation thi — nayi jagah, homesick. Saath mein baat ki toh thoda achha feel hua. Yahi college life hai shayad.", recordedAt: randomDate(3, 2.9), durationSeconds: rand(100,160) },

    { text: "Pehla midsem exam tha aaj Mathematics ka. Raat bhar padha tha, 3 baje tak notes banaye. Exam hall mein ghusta tha toh haath thoda kaamp raha tha. Paper medium level tha, zyatdar questions solve ho gaye. Rahul ne baad mein bola uska bhi theek gaya. Exam ke baad hum dono park gaye, ice cream khayi aur tension release ki. Result ka wait hai ab.", recordedAt: randomDate(3, 2.9), durationSeconds: rand(90,140) },

    { text: "College ka pehla fest tha is hafte — Techfest. Maine pehli baar kisi coding competition mein register kiya. Partner Rahul tha mera. Problem statement milte hi hum dono excited ho gaye, saath mein strategy banayi. Competition mein top 10 mein nahi aaye lekin experience bahut achha raha. Stage pe jaana, dusre teams se milna, kuch naya seekhna — sab mast laga.", recordedAt: randomDate(3, 2.9), durationSeconds: rand(110,170) },

    { text: "Aaj maa ka birthday tha. Subah call ki toh wo ro padi thodi. Pehli baar birthday pe ghar nahi tha unke saath. Maine ek chhoti si gift order ki online aur ek long voice message bheja unhein. Sham ko hostel mein Rahul ne surprise cake mangaya mere liye celebrate karne ke liye. Itni chhoti si baat pe itna achha feel hua. Dosto ki value samajh aa rahi hai dheere dheere.", recordedAt: randomDate(3, 2.9), durationSeconds: rand(100,150) },

    { text: "Physics lab mein aaj ek experiment fail ho gaya hamare group ka. Puri team frustrated thi kyunki kafi mehnat ki thi. Professor ne bola dobara karna hoga next week. Ghar aake bahut demotivated feel hua. Raat ko Rahul ne call ki aur bola yaar failures se hi seekhte hain, chill kar. Uski baat sunke thoda better feel hua. Next week dobara karte hain properly.", recordedAt: randomDate(3, 2.9), durationSeconds: rand(90,140) },

    { text: "Aaj pehli baar college library mein ghanta bhar baitha padha. Syllabus bahut bada lag raha hai, samajh nahi aa raha kahan se start karun. Ek senior mila — Vikram bhaiya — unhone achha guidance diya. Bole ki pehle concepts clear karo, ratta mat maaro. Unki baat logic mein aati hai. Rahul ko bhi milaya unse, ab hum dono unse regularly guidance lete hain.", recordedAt: randomDate(3, 2.9), durationSeconds: rand(95,145) },

    { text: "Semester ka pehla result aaya. Mera GPA 8.4 aaya — expected se thoda kam. Thoda disappointing laga initially. Papa ko bataya toh unhone kaha achha hai, improve karte raho. Rahul ka 8.7 aaya, wo khush tha. Maine decide kiya ki next semester mein zyada focus karunga. Vikram bhaiya ne bola first sem mein adjustment hoti hai, zyada sochna mat.", recordedAt: randomDate(2.8, 2.6), durationSeconds: rand(90,140) },

    { text: "Winter break mein ghar gaya tha. Maa ne bahut saara khana banaya — rajma chawal, gajar ka halwa, sab favourite dishes. Papa se career ke baare mein baat ki, unhone kaha engineering ke saath apni skills bhi build karo. Chhoti behan Ananya ke saath movies dekhe, timepass kiya. Ghar pe 2 hafte bahut sukoon mein gaye. Wapas college jaate time dil bhaari hua.", recordedAt: randomDate(2.8, 2.7), durationSeconds: rand(110,160) },

    { text: "Naya semester shuru hua aaj. Data Structures ka first class tha. Professor bahut strict lagte hain. Syllabus dekha toh arrays, linked lists, trees, graphs sab cover hoga. Rahul ke saath baitha class mein, dono ne notes liye. Pehle din se hi homework mil gayi. Ye semester tough lagta hai lekin interesting bhi. Consistent rehna hoga is baar.", recordedAt: randomDate(2.8, 2.7), durationSeconds: rand(85,130) },

    { text: "Aaj Priya se college mein pehli baar baat ki. Wo bhi CS mein hai, ek section alag tha. Library mein same table pe baithe the, DSA ke notes compare kiye. Bahut intelligent lagti hai, concepts bahut clear hain uske. Wo bhi placement ke liye seriously prepare kar rahi hai second year se hi. Hum teeno — main, Rahul, aur Priya — ek group bana liya study ke liye.", recordedAt: randomDate(2.7, 2.6), durationSeconds: rand(90,140) },

    { text: "Pehli baar ek open source project mein contribute kiya aaj. GitHub pe ek chhota sa bug fix kiya. PR merge hua toh itna achha feel hua. Rahul ne bola yaar ye toh bahut bada deal hai, teri pehli open source contribution. Maine bhi realize kiya ki haan, ye ek milestone hai. Priya ne bhi encourage kiya aur bol rahi thi wo bhi start karegi ab.", recordedAt: randomDate(2.7, 2.6), durationSeconds: rand(80,130) },

    { text: "Aaj ek senior Arjun bhaiya ne ek workshop conduct kiya Web Development pe. Bahut insightful tha. HTML, CSS, JavaScript basics se lekar React tak cover kiya unhone. Notes liye bharpoor. Baad mein personally milke kuch doubts puche, unhone bahut patiently explain kiya. Aisa lagta hai ye field mujhe pasand hai. Rahul aur Priya dono bhi saath the, teeno inspired feel kar rahe the.", recordedAt: randomDate(2.7, 2.5), durationSeconds: rand(100,160) },

    { text: "Aaj raat bhar ek project banaya akela. Todo app thi, React mein. Pehli baar hooks use kiye, useState aur useEffect. Kaafi bugs aaye, stack overflow pe dhundha, YouTube tutorials dekhe. Subah 4 baje project complete hua. Thaka hua tha lekin satisfaction tha ek alag level ka. Rahul ne subah dekha toh bola yaar tu serious ho gaya hai coding mein.", recordedAt: randomDate(2.6, 2.5), durationSeconds: rand(110,160) },

    // ── YEAR 2 AGO (2nd year college) ─────────────────────

    { text: "Aaj ek bade internship fair mein gaya college mein. 30 se zyada companies aayi thi. Resume lekar ghumta raha, kuch companies ke stalls pe gaya, baat ki. Ek company ne immediate callback diya — Zomato ka technical team. Nervous tha lekin interview achhi gayi. Shortlist ho gaya pehle round ke liye. Priya aur Rahul dono bhi apply kar rahe hain alag alag companies mein.", recordedAt: randomDate(2.5, 2.4), durationSeconds: rand(110,170) },

    { text: "Aaj LinkedIn profile properly update kiya. Projects add kiye, skills add kiye, open to work lagaya. Priya ne review kiya mera profile aur kuch suggestions diye — headline better karo, summary mein achievements daalo. Bahut helpful laga. Rahul ka profile bhi update karaya saath mein. Ye sab career ke liye zaruri hai ab seriously sochna hoga.", recordedAt: randomDate(2.5, 2.4), durationSeconds: rand(85,135) },

    { text: "Pehle internship interview mein reject ho gaya aaj. Zomato ne bola technical skills thodi aur strong chahiye. Bahut demotivated feel hua. Raat ko Priya ne call ki aur bola ek rejection se kuch nahi hota, teri journey abhi shuru hui hai. Rahul ne bhi motivate kiya. Unhone sahi kaha — ye toh practice tha, next better hoga. Resume improve karta hoon aur dobara try karunga.", recordedAt: randomDate(2.5, 2.3), durationSeconds: rand(100,155) },

    { text: "Aaj Arjun bhaiya se lambi baat ki unke startup ke baare mein. Wo 2nd year mein hi ek chhota product launch karna chahte the. Unka plan sun ke inspire hua. Maine pucha ki kya college ke saath startup possible hai, unhone bola possible hai par sacrifice bahut hai. Time management aur priorities clear honi chahiye. Sochta hoon apne andar bhi entrepreneur kuch hai ya nahi.", recordedAt: randomDate(2.4, 2.3), durationSeconds: rand(110,165) },

    { text: "Aaj DSA ki practice mein pehli baar ek hard level problem solve ki — LeetCode pe binary tree wali. 2 ghante lage, kaafi hints liye, multiple approaches try kiye. Jab finally solution submit kiya aur green tick aaya toh ek alag hi feeling thi. Rahul ko immediately call kiya, wo bhi excited ho gaya. Priya ne bola ab regularly hard problems karo. Yahi hoga ab schedule.", recordedAt: randomDate(2.4, 2.3), durationSeconds: rand(100,150) },

    { text: "Aaj college project mein pehli baar Node.js aur Express use kiya. REST API banai ek simple todo backend ke liye. GET, POST, DELETE endpoints sab kaam kar rahe the. Rahul ne frontend banaya React mein, hum dono ne fullstack project complete kiya. Professor ne dekha toh bola bahut achha kiya, industry-ready thinking hai. Ye sunke bahut proud feel hua.", recordedAt: randomDate(2.3, 2.2), durationSeconds: rand(95,150) },

    { text: "Priya ko aaj ek badi company ka internship offer mila — Flipkart. Wo bahut excited thi, hum sab ne canteen mein celebrate kiya. Rahul thoda jealous feel kar raha tha but handled it well. Maine Priya ko congratulate kiya, wo deserve karti hai. Usne bola ab tumhara turn hai, prepare karte raho. Ye dekhke mujhe bhi aur seriously lena hoga apni prep ko.", recordedAt: randomDate(2.3, 2.2), durationSeconds: rand(100,155) },

    { text: "Maa ki tabiyat achanak kharab ho gayi aaj. Papa ne call kiya subah — bukhar tha aur BP thoda high tha. Main ghabraaya, immediately ticket book karne ki socha. Papa ne bola abhi aane ki zarurat nahi, dawa shuru ho gayi. Raat bhar anxious raha, baar baar call karta raha. Subah tak maa thodi better thi. Door rehna aur ghar ki khabar na kar paana — ye sabse mushkil hai college mein.", recordedAt: randomDate(2.3, 2.1), durationSeconds: rand(110,165) },

    { text: "Aaj college mein pehli baar ek technical talk diya — 5 minute lightning talk tha. Topic tha REST APIs kaise kaam karti hain. Pehle se bahut practice ki thi mirror ke saamne. Stage pe jaake thoda voice kaaanpa lekin content clear tha. Baad mein professor ne bola confidence aur aur improve karo. Priya ne bola bahut achha tha, sirf nervous mat ho agle baar. Overall achha experience tha.", recordedAt: randomDate(2.2, 2.1), durationSeconds: rand(95,145) },

    { text: "Aaj ek study session tha raat bhar Rahul ke saath. Operating Systems ka exam tha kal. Processes, threads, deadlocks, scheduling algorithms sab cover kiya ek raat mein. 4 baje tak jagte rahe, coffee ke 3 cup piye. Exam hall mein jaake thoda fresh feel hua, paper dekha toh medium tha. Rahul ne bola concepts clear rahe toh paper easy lagta hai. Sach mein.", recordedAt: randomDate(2.2, 2.1), durationSeconds: rand(100,155) },

    { text: "Aaj pehli baar PostgreSQL ke saath kaam kiya seriously. College project ke liye database design kiya — tables banaye, relationships define kiye, queries likhi. JOIN queries pehli baar achi tarah samajh aayi. Rahul ne bola yaar tu backend developer ban jaayega pakka. Mujhe bhi lagta hai backend mein zyada interest hai mujhe — logic, data, APIs sab mujhe achha lagta hai.", recordedAt: randomDate(2.1, 2.0), durationSeconds: rand(95,145) },

    { text: "Aaj Arjun bhaiya ne apna startup officially register karaya — Cognify AI naam rakh raha hai. Maine aur Rahul ne unhe help ki presentation polish karne mein. Pitch deck review kiya, kuch suggestions diye. Wo bahut grateful the. Dekhke lagta hai unka passion real hai, sirf idea nahi, execution bhi kar rahe hain. Inspire karta hai mujhe unka dedication.", recordedAt: randomDate(2.1, 2.0), durationSeconds: rand(100,150) },

    { text: "Semester exams complete hue aaj. Bahut pressure tha is baar — 6 subjects, sab mein mehnat ki. Results ka wait hai ab. Priya ne suggest kiya ki results se pehle ek din break lete hain sab mil ke. Hum teeno park gaye, khana khaaya, movies dekhi. Bahut refreshing tha. Ye dono — Priya aur Rahul — meri sabse badi support system ban gaye hain college mein.", recordedAt: randomDate(2.0, 1.9), durationSeconds: rand(105,160) },

    { text: "Semester result aaya aaj. Mera GPA 9.1 aaya is baar — pichle semester se kaafi improvement. Bahut khushi hui. Papa ne call pe sunke proud feel kiya. Maa ne bola shabaash beta. Rahul ka 8.9 aaya, wo bhi bahut khush tha. Priya ka 9.4 — wo topper hai group mein. Sab ne ek dusre ko treat di canteen mein. Ye milestone tha apne liye.", recordedAt: randomDate(2.0, 1.9), durationSeconds: rand(100,155) },

    // ── YEAR 1-2 AGO (3rd year, internships, placements) ──

    { text: "Aaj internship ka pehla din tha ek product startup mein. Office chhota tha lekin vibe bahut achi thi — open space, bean bags, whiteboard pe ideas likhe hue. Mentor mila — Sneha didi — unhone pehle din ka plan explain kiya. Codebase dekha toh overwhelming laga, itna bada tha. Lekin Sneha didi ne bola ek file ek time pe, jaldi samajh aayega. Excited hoon aage ke liye.", recordedAt: randomDate(1.9, 1.8), durationSeconds: rand(110,170) },

    { text: "Internship mein pehla proper task mila aaj — ek REST API endpoint banana tha user authentication ke liye. JWT tokens ka use karna tha. Pehle se thoda pata tha theory lekin production code likhna alag hota hai. Kaafi research ki, documentation padhi, Sneha didi se doubt pucha. Sham tak endpoint ready tha aur testing pass ho gayi. Bahut satisfying tha.", recordedAt: randomDate(1.9, 1.8), durationSeconds: rand(100,155) },

    { text: "Aaj internship mein ek serious bug fix kiya jo production mein tha. Memory leak tha Node.js backend mein, performance degrade ho rahi thi. 3 ghante lage trace karne mein, finally async function mein ek unhandled promise tha. Fix kiya, deploy kiya, metrics improve hue. Senior engineer ne bola achha kaam kiya. Ye pehli baar tha ki real impact feel hua apne kaam ka.", recordedAt: randomDate(1.8, 1.7), durationSeconds: rand(110,165) },

    { text: "Priya Flipkart internship se return ki aaj. Bahut kuch seekha bola — scale pe kaise kaam hota hai, large codebase navigation, team dynamics. Hum sab ek saath mile aur uski experience sunne baithhe. Rahul bahut curious tha, main bhi. Priya ne notes bhi share kiye apne experience ke. Uski growth clearly dikh rahi hai — zyada confident, zyada mature professionally.", recordedAt: randomDate(1.8, 1.7), durationSeconds: rand(100,155) },

    { text: "Aaj Arjun bhaiya ke startup mein ek weekend hackathon tha. Main aur Rahul dono gaye. 8 ghante mein ek feature build karna tha. Hum dono ne backend aur frontend divide kiya. Presentation di, judges ne appreciate kiya. Arjun bhaiya bahut khush the. Pehli baar feel hua ki startup environment mein kaam karna alag hi hota hai — fast, chaotic, aur fun.", recordedAt: randomDate(1.7, 1.6), durationSeconds: rand(110,165) },

    { text: "Placement season shuru hona wala hai. College mein buzz hai. Seniors ne bata raha hai ki August se companies aana shuru ho jaati hain. Priya ne ek study plan banaya — roz 3 leetcode problems, system design weekends pe, HR prep bhi. Maine aur Rahul ne bhi follow karna shuru kiya. Ye next 6 mahine career ke liye sabse important honge.", recordedAt: randomDate(1.7, 1.6), durationSeconds: rand(95,150) },

    { text: "Aaj pehli baar system design interview practice ki. Load balancer, database sharding, caching — sab concepts naye lage. YouTube pe Gaurav Sen ka video dekha, kaafi clearer hua. Rahul ke saath mock interview kiya — ek interviewer ek candidate. Bahut helpful tha. Priya ne bola consistently karo, ek hafte mein difference dikhega. She was right.", recordedAt: randomDate(1.6, 1.5), durationSeconds: rand(100,155) },

    { text: "Pehli badi company ka placement test tha aaj — Google. 90 minute, 3 coding problems. Pehla easy tha, doosra medium, teesra hard tha. Hard wala solve nahi hua. Rahul ne bola uska bhi same hua. Result aaya — dono reject. Priya bhi reject. Bahut bura laga. Raat ko teeno saath baithke baat ki. Google se seekha, agle company better karenge.", recordedAt: randomDate(1.6, 1.5), durationSeconds: rand(110,165) },

    { text: "Microsoft ka test tha aaj. Pichle baar se zyada prepared tha. 2 coding problems aur ek system design. Dono coding solve kar liye, system design mein thoda weak tha. Result mein Rahul ka naam tha shortlist mein, mera nahi. Mixed feelings — Rahul ke liye khushi aur apne liye disappointment. Par Rahul deserve karta hai, usne bahut mehnat ki thi.", recordedAt: randomDate(1.5, 1.4), durationSeconds: rand(105,160) },

    { text: "Rahul ki Microsoft interview aayi aaj. Main poora din anxious tha uske liye — jaise meri hi interview ho. 3 rounds the — 2 technical, 1 HR. Sab ke baad Rahul bahut drained lag raha tha par confident bhi. Result kal aayega. Maine usse ghar bheja aur bola rest kar. Priya ne khana order kiya Zomato se teeno ke liye. Kal ka wait hai.", recordedAt: randomDate(1.5, 1.4), durationSeconds: rand(100,155) },

    { text: "Rahul ka Microsoft mein placement confirm ho gaya aaj. Phone pe baat ki toh uski awaaz kaanp rahi thi excitement se. Rona bhi lag raha tha thoda. Hum sab bahut khush the — Priya ne immediately restaurant book kiya dinner ke liye. Rahul ke parents bhi aaye celebrate karne. Itne saath mehnat ki thi uske saath, unki khushi apni khushi lag rahi thi.", recordedAt: randomDate(1.5, 1.4), durationSeconds: rand(110,165) },

    { text: "Aaj ek VC ke saath Arjun bhaiya ki meeting thi, main bhi saath tha unke support ke liye. Meeting 1 ghante ki thi. VC ne kaafi tough questions puche — unit economics, competition, moat. Arjun bhaiya ne confidently handle kiya. Meeting ke baad bole ye promising tha. Mujhe samajh aaya ki investor conversations kitni alag hoti hain normal conversations se.", recordedAt: randomDate(1.4, 1.3), durationSeconds: rand(110,165) },

    { text: "Internship mein aaj apna first proper feature launch kiya production mein. User notification system tha jo maine 3 hafte mein build kiya. Deploy ke baad metrics dekha toh engagement 15% improve hua notification wale users ke liye. Manager ne team mein publicly appreciate kiya. Pehli baar real world impact dikh raha tha apne kaam ka. Bahut proud feel hua.", recordedAt: randomDate(1.4, 1.3), durationSeconds: rand(110,165) },

    { text: "Aaj Priya ne bataya Google ka offer aaya hai finally. Interview process 3 mahine lamba tha — 6 rounds the. Bahut mehnat ki thi usne consistently. SDE-2 role, Bengaluru mein. Package bhi bahut achha tha. Main aur Rahul dono ek second ke liye shock mein the phir congratulate kiya dil se. Wo deserve karti hai completely. Abhi toh hum sab mein wo sabse aage hai.", recordedAt: randomDate(1.3, 1.2), durationSeconds: rand(110,165) },

    { text: "Priya ki farewell thi aaj college mein. Sab emotional ho gaye — seniors juniors sab. Usne ek speech di jo bahut touching thi. Boli ki yahan ke log aur memories hamesha yaad rahenge. Main bhi emotional ho gaya thoda. Priya, Rahul aur main teeno bahut tight group ban gaye the. Ab geographically alag ho jaayenge lekin bond same rahega.", recordedAt: randomDate(1.3, 1.2), durationSeconds: rand(105,160) },

    { text: "Amazon ka test diya aaj. Pichle sab failures se bahut kuch seekha tha. Aaj confident tha — 3 problems, sab solve kiye. Shortlist aaya ek ghante mein. Interview ke liye call aaya next week ka. Rahul, Priya, Papa, Maa — sab ko bataya. Sab ne encourage kiya. Ab interview ki preparation shuru karte hain seriously.", recordedAt: randomDate(1.2, 1.1), durationSeconds: rand(100,155) },

    { text: "Amazon interview tha aaj. Do technical rounds the bahut intense. Binary trees, dynamic programming, ek system design bhi aaya. Sab mein participate kiya confidently. HR round mein leadership principles ke questions the. Sham ko bahut drained feel kiya lekin confident bhi. Result mein 2-3 din lagte hain. Priya ne call ki aur bol rahi thi confident lag raha tha tujhe.", recordedAt: randomDate(1.2, 1.1), durationSeconds: rand(110,165) },

    { text: "Amazon ka offer aaya. Ek ghante se zyada roya — khushi mein. Papa ko bataya toh unki bhi awaaz bhar aayi. Maa ne bola meri prayers ka asar hua. Rahul ne mujhe tight hug kiya. Priya ne Bengaluru se video call kiya, boli main jaanta tha tu kar lega. Arjun bhaiya ne bola ab toh definitely startup try karna kuch saal baad. Ye din hamesha yaad rahega.", recordedAt: randomDate(1.1, 1.0), durationSeconds: rand(120,180) },

    // ── YEAR 0-1 AGO (Final year + job start) ─────────────

    { text: "Final year shuru ho gaya. Major project select karna tha. Maine decide kiya ki AI-based project karunga — specifically memory aur RAG architecture pe kuch banana chahta hoon. Rahul interested hai collaborate karne mein. Ek week mein detailed proposal likha, professor ne approve kiya. Ye project kuch meaningful ban sakta hai, sirf college project se zyada.", recordedAt: randomDate(1.0, 0.9), durationSeconds: rand(100,155) },

    { text: "Aaj pehli baar properly vector databases ke baare mein padha. pgvector, Pinecone, Weaviate sab research kiya. Semantic search ka concept samajh aaya — ki similar meaning ke sentences close hote hain vector space mein. Ye mere major project ke liye perfect fit hai. Rahul ne bola yaar ye toh kafi advanced hai, sure ho? Main 100% confident hoon is direction mein.", recordedAt: randomDate(1.0, 0.9), durationSeconds: rand(105,160) },

    { text: "Major project ka architecture design kiya aaj. RAG pipeline kaise kaam karegi, embedding model kaun sa use karein, database schema kya hogi — sab whiteboard pe map kiya Rahul ke saath. 3 ghante baithe the library mein. Architecture solid lag raha tha. Professor ko dikhaaya toh unhone bola ye production-grade thinking hai. Kal se implementation shuru karate hain.", recordedAt: randomDate(0.9, 0.8), durationSeconds: rand(110,165) },

    { text: "Aaj Amazon joining letter aaya officially. 3 mahine baad joining hai. Mixed feelings hain — excited bhi hoon aur thoda sad bhi ki college khatam hone wala hai. Ye campus, ye log, ye canteen, ye late nights library mein — sab miss hoga. Priya Bengaluru mein hai, Rahul Hyderabad jaayega, main kahan jaaunga ye abhi decide nahi hua. Life ka naya chapter shuru hone wala hai.", recordedAt: randomDate(0.9, 0.8), durationSeconds: rand(110,165) },

    { text: "Arjun bhaiya ke startup Cognify AI ko Series A funding mili. 2 crore ka round tha. Team bhi expand ho rahi hai. Unhone officially offer kiya ki joining ke 2 saal baad agar startup join karna ho toh unka door open hai. Bahut seriously soch raha hoon is offer ko. Papa ki advice yaad aayi — pehle badi company mein kaam karo, experience lo, phir socho.", recordedAt: randomDate(0.8, 0.7), durationSeconds: rand(105,160) },

    { text: "Final year ka major project aaj submit ho gaya. Puri raat jaag ke last bug fix kiya, documentation complete ki, README likhi. Subah submit kiya toh ek alag relief tha. 8 mahine ki mehnat thi is mein. Rahul ne bola yaar ye toh genuinely useful product bana hai, sirf assignment nahi. Professor ne initial feedback diya — bahut strong technical implementation.", recordedAt: randomDate(0.8, 0.7), durationSeconds: rand(110,165) },

    { text: "College ka last exam diya aaj. 4 saal complete ho gaye engineering ke. Exam hall se nikala toh ek strange feeling thi — relief, nostalgia, excitement, sadness sab ek saath. Rahul exam ke baad roya thoda. Priya video call pe thi, wo bhi emotional thi. Hum teeno ne promise kiya ki chaahe kuch bhi ho, hum connected rahenge hamesha.", recordedAt: randomDate(0.7, 0.6), durationSeconds: rand(115,170) },

    { text: "Convocation tha aaj. Pehli baar properly dressed tha — formal shirt, degree haath mein. Papa aur Maa dono aaye the. Papa ki aankhon mein aansu the jab degree li maine. Maa ne gale lag gayi. Pura din photos khiche, dosto se mila, professors se mila. Ye din clearly yaad rahega lifetime ke liye. 4 saal ki mehnat ka conclusion tha aaj.", recordedAt: randomDate(0.7, 0.6), durationSeconds: rand(115,170) },

    { text: "Amazon joining kal hai. Aaj last free din tha. Subah late uthha, maa ke haath ka nashta kiya, dopahar ko park gaya akela. Bahut kuch soch raha tha — kya job mein achha karunga, kya expectations hain, kya log milenge. Evening ko Rahul ne surprise video call set kiya — Priya, Arjun bhaiya, aur baaki dost bhi the. Sab ne best wishes diye. Heart bahut bhaara tha.", recordedAt: randomDate(0.6, 0.5), durationSeconds: rand(110,165) },

    { text: "Amazon mein first day tha aaj. Office itna bada tha ki orientation mein hi lost feel kiya. 50 nayi joinees thi. Buddy assigned hua — Meera — wo bahut helpful thi, sab kuch navigate karaya. Laptop setup kiya, access mila systems ka. Manager se mila, bahut friendly the. Kaafi information overload tha pehle din. Ghar aake thaka hua tha par excited bhi.", recordedAt: randomDate(0.6, 0.5), durationSeconds: rand(110,165) },

    { text: "Amazon mein pehle hafte ke baad review. Codebase bahut massive hai, pehle toh sirf padhta raha. Meera ne help ki navigate karne mein. Team bahut talented hai — MIT, IIT wale hain. Pehli baar imposter syndrome feel hua thoda. Rahul ne call kiya, maine bataya toh usne bola yaar tu wahan toh select hua, apni value pe trust kar. Sach hai uski baat.", recordedAt: randomDate(0.5, 0.4), durationSeconds: rand(105,160) },

    { text: "Aaj pehla production PR merge hua Amazon mein. Ek small optimization thi — database query ko optimize kiya, latency 200ms se 80ms ho gayi. Senior engineer ne PR review mein likha 'good catch'. Itni chhoti baat pe itna achha feel hua. Priya ko bataya toh usne bola teri journey shuru ho gayi properly. Rahul ne bola party chahiye weekend pe.", recordedAt: randomDate(0.5, 0.4), durationSeconds: rand(100,155) },

    { text: "Weekend pe Arjun bhaiya se coffee pe mila. Unhone startup ki latest update di — product launch ho gaya, 500 paying customers hain abhi. Kuch investment bhi discuss ki. Phir unhone seriously offer diya — technical co-founder banna chahoge? Ek second ke liye heart tez dhadka. Bola sochta hoon. Ye decision bahut bada hai. Job chhodni padegi, uncertainty hogi.", recordedAt: randomDate(0.4, 0.3), durationSeconds: rand(115,170) },

    { text: "Priya Bengaluru se ghar aayi thi is baar. Hum sab mile — main, Rahul, Priya. Pehli baar itne mahino baad physically saath the. Restaurant mein dinner kiya, purani college ki yaadein share ki, bahut hanse. Priya bahut grow kar gayi hai professionally — zyada confident, zyada articulate. Rahul bhi settle ho gaya hai Hyderabad mein. Sab apni apni life mein aage badh rahe hain.", recordedAt: randomDate(0.4, 0.3), durationSeconds: rand(110,165) },

    { text: "Amazon mein 6 mahine complete hue aaj. Manager ne mid-year review kiya. Feedback bahut positive tha — bola technically strong ho aur seekhne ki speed achhi hai. Rating 'exceeds expectations' aayi. Salary increment bhi mila. Bahut proud feel hua. Papa ko bataya toh unhone kaha beta hum bahut proud hain. Maa ne bola ab achha khana khao, healthy raho.", recordedAt: randomDate(0.3, 0.2), durationSeconds: rand(110,165) },

    { text: "Aaj ek bada decision liya. Arjun bhaiya ko bola ki 1 saal aur Amazon mein karunga, phir seriously startup ke baare mein soochunga. Unhone bola bilkul, door open hai. Relief feel hua decision lete hi. Clarity achhi hoti hai jab priorities clear ho jaayein. Rahul se baat ki, usne bola sahi kiya, jaldi mat karo bade decisions mein. Priya ne bhi agree kiya.", recordedAt: randomDate(0.3, 0.2), durationSeconds: rand(105,160) },

    { text: "Ghar pe family vacation plan hua — Shimla. Bahut saalon baad family trip tha. Papa, Maa, Ananya aur main. Pahado mein jaake sab kuch chhoot gaya — kaam, decisions, future ki tension. Ananya bohot badi ho gayi hai, college ke baare mein pooch rahi thi mujhse. Maine sab sach bataya — struggles bhi, achievements bhi. Family time is the best recharge.", recordedAt: randomDate(0.2, 0.1), durationSeconds: rand(115,170) },

    { text: "Wapas office aaya Shimla trip ke baad. Fresh mind se kaafi kuch clear dikh raha tha. Ek naya feature design kiya jo genuinely users ki problem solve karega. Team ko pitched kiya, sab ne appreciate kiya. Ek interesting conversation hua senior architect se — unhone bola tum product thinking karte ho, sirf engineering nahi. Ye compliment bahut meaningful tha.", recordedAt: randomDate(0.2, 0.1), durationSeconds: rand(100,155) },

    { text: "Aaj Smaran project pe seriously kaam shuru kiya. Ye idea kaafi time se tha — AI-powered voice memory companion. College major project ne seed daala tha but ab production quality banana hai. Architecture design kiya, tech stack finalize kiya — Node.js, PostgreSQL, pgvector, Gemini. Ishan bhi excited hai Android side ke liye. Rumik hackathon perfect opportunity hai is idea ko test karne ki.", recordedAt: randomDate(0.1, 0.0), durationSeconds: rand(110,165) },

    { text: "Smaran ka backend MVP ready ho gaya aaj. Auth endpoints, memory save, vector embedding, semantic search — sab working hai. Railway pe deploy kiya. Pehli memory save ki aur phir query kiya — answer bilkul sahi aaya. Bahut satisfying tha dekhna. Ishan ne Android side se connect kiya, end to end flow kaam kar raha tha. Kal hackathon hai, feeling confident hai.", recordedAt: randomDate(0.05, 0.0), durationSeconds: rand(115,170) },

    // ── ADDITIONAL MEMORIES — More arcs & variety ─────────

    { text: "Aaj ek online course shuru kiya System Design ka — Grokking System Design Interview. Pehle module mein load balancers, horizontal vs vertical scaling cover kiya. Bohot concepts clear hue jo pehle vague the. Notes banaaye detailed. Rahul ko bhi recommend kiya yahi course. Priya ne bola ye course Google interview mein bahut kaam aaya tha uske. Regularly follow karunga ab.", recordedAt: randomDate(1.3, 1.2), durationSeconds: rand(95,145) },

    { text: "Aaj subah 5 baje uth gaya accidentally. Neend nahi aayi wapas toh balcony pe baitha raha. Subah ki hawa, quiet roads, birds ki awaaz — itna peaceful tha. Ek ghanta bas baitha raha kuch nahi kiya. Realize hua ki main bahut rarely khud ke saath time spend karta hoon. Sab kuch itna busy hai — kaam, prep, dost, family. Akela waqt bhi zaruri hai.", recordedAt: randomDate(1.5, 1.3), durationSeconds: rand(80,130) },

    { text: "Papa se aaj bahut lambi baat ki career ke baare mein. Unhone apni generation ki struggles bataayi — limited options, less resources. Aaj ke time mein kitni opportunities hain. Mujhe lagta hai kabhi kabhi main opportunities ko granted le leta hoon. Papa ki baat sunke perspective shift hua. Unka sacrifice real hai, mujhe truly apna best dena chahiye unke liye bhi.", recordedAt: randomDate(1.6, 1.4), durationSeconds: rand(100,155) },

    { text: "Aaj pehli baar properly meditation try ki — 20 minute Headspace app pe. Mind bahut restless tha initially, thoughts aa rahe the kaam ke, future ke. Lekin gradually settle hua. Baad mein genuinely calm feel kiya. Rahul ne bola wo bhi karta hai roz. Ye seriously start karna chahiye daily. Mental health pe focus karna utna hi zaruri hai jitna physical health pe.", recordedAt: randomDate(1.4, 1.2), durationSeconds: rand(75,120) },

    { text: "Aaj Meera — Amazon mein buddy — ke saath lunch kiya. Uski journey interesting hai — tier 3 college se Amazon tak. Baat karte karte realize hua ki background nahi, consistency aur learning mindset matter karta hai. Maine apna Smaran idea share kiya, wo bahut excited ho gayi. Boli ye genuinely useful product idea hai. External validation achha lagta hai kabhi kabhi.", recordedAt: randomDate(0.4, 0.3), durationSeconds: rand(95,145) },

    { text: "Raat ko achanak purani photos dekh raha tha phone mein. 1st year college ki photos dekhi — kitna different tha sab. Wo campus ka excitement, naive enthusiasm, sab naya tha. Aaj 4 saal baad bahut kuch badal gaya — main bhi, dost bhi, priorities bhi. Growth visible hai photos mein. Nostalgic feeling tha lekin sad nahi — proud tha apni journey pe.", recordedAt: randomDate(0.5, 0.3), durationSeconds: rand(80,130) },

    { text: "Ananya ne aaj call ki — college admissions ke baare mein guidance chahiye thi. Maine sab honestly bataya — college choose karne ka criteria kya hona chahiye, CS vs other branches, college brand vs learning environment. 1 ghante ki call thi. Ananya ne bola bhaiya tumse baat karke itna clear ho gaya. Family ko help karna ek alag satisfaction deta hai.", recordedAt: randomDate(0.3, 0.1), durationSeconds: rand(95,150) },

    { text: "Aaj bahut bura din tha. Kaam mein ek major mistake hua — wrong config production mein push ho gayi, 30 minute downtime tha. Team ne sab milke fix kiya. Manager ne baad mein bola koi baat nahi, learnings document karo. Par andar se bahut bura feel kiya. Rahul ko raat ko bataya, usne bola bhai ye senior engineers ke saath bhi hota hai. Chal aage badho.", recordedAt: randomDate(0.5, 0.4), durationSeconds: rand(100,155) },

    { text: "Aaj Ishan se pehli baar ek serious technical discussion ki Smaran ke baare mein. Wo Android side handle karega — STT ke liye Deepgram, TTS ke liye Silk by Rumik. Maine backend explain kiya — RAG pipeline, vector search, Gemini integration. Dono ne realize kiya ki ye genuinely solve karta hai ek real problem. AI companions ka memory problem — jo ChatGPT solve nahi kar sakta.", recordedAt: randomDate(0.1, 0.0), durationSeconds: rand(110,165) },

    { text: "Rumik hackathon ke liye registration ho gayi. 12 PM se 8 PM, aaj ki date. Prize hai 1 lakh ka Silk API tokens. Main backend pe focus karunga — Node.js, Express, PostgreSQL, pgvector sab ready karna hai. Ishan Android pe kaam karega. Planning done hai, execution ka time hai. Nervous hoon thoda but excited zyada. Ye idea mein bahut potential hai.", recordedAt: randomDate(0.02, 0.0), durationSeconds: rand(90,140) },

    // ── MORE VARIED MEMORIES ───────────────────────────────

    { text: "Aaj college ki canteen mein ek interesting conversation hua. Ek junior ne aake pucha placement ke baare mein tips. Maine sab bataya jo main chahta tha koi mujhe 2 saal pehle bata deta — DSA consistently karo, projects build karo, network genuinely karo. Junior bahut grateful tha. Realize kiya ki teaching bhi ek powerful way hai learning ko reinforce karne ka.", recordedAt: randomDate(1.2, 1.0), durationSeconds: rand(90,145) },

    { text: "Aaj ek coding challenge mein first rank aaya college mein — Competitive Programming Contest tha. 5 problems mein se 4 solve kiye, sabse fast submission thi. Certificate mila, cash prize bhi thoda mila. Papa ko photo bheja toh unhone WhatsApp status pe lagaa diya. Maa ne sweet banaayi ghar pe. Chhoti achievements bhi celebrate karni chahiye.", recordedAt: randomDate(1.7, 1.5), durationSeconds: rand(90,145) },

    { text: "Rahul se aaj ek baat hui jo bahut meaningful thi. Wo bata raha tha ki Microsoft mein kuch din bahut hard hote hain, homesick ho jaata hai, imposter syndrome aata hai. Lekin phir bhi push karta rehta hai. Maine bola yaar ye honest conversation ke liye thanks, aksar log achha hi dikhate hain. Humari dosti itni real isliye hai kyunki hum dono honest hain ek dusre ke saath.", recordedAt: randomDate(0.4, 0.2), durationSeconds: rand(100,155) },

    { text: "Aaj ek mental health day liya — deliberately kuch productive nahi kiya. Sirf books padhi, music suna, ghar pe khana banaya leisurely. Pehle guilt feel hoa rest karte waqt. Phir realize kiya ye guilt unhealthy hai. Rest productivity ka part hai. Rahul ne encourage kiya — bola tu bahut kaam karta hai yaar, ye break deserve karta hai tu.", recordedAt: randomDate(0.6, 0.4), durationSeconds: rand(85,135) },

    { text: "Vikram bhaiya se — college ke senior — achanak baat hui LinkedIn pe. Wo ab ek unicorn startup mein Principal Engineer hain. Maine apna journey update kiya, unhone genuinely proud feel kiya sunn ke. Bole tumhara college wala curiosity aur hustle yaad hai mujhe. Chhoti si feedback tha lekin bahut meaningful. Log yaad rakhte hain agar tum genuine raho.", recordedAt: randomDate(0.5, 0.3), durationSeconds: rand(90,145) },

    { text: "Aaj bohot saari emails clear ki backlog ki. Inbox zero achieve kiya first time in years. Chhoti si cheez hai par satisfying tha. Phir properly to-do list banai, priorities set ki. Feeling organized aur in control. Priya ne ek bar bola tha ki productivity apni mental state se directly linked hoti hai. Aaj samajh aaya practically.", recordedAt: randomDate(0.7, 0.5), durationSeconds: rand(75,120) },

    { text: "Aaj ek interesting paper padha — Attention is All You Need — Transformer architecture wala. Pehle bahut confusing laga, 3 baar padha. Finally samajha kaise attention mechanism kaam karta hai. Rahul ko explain kiya — teaching se apni understanding aur pakki hoti hai. Priya ne bola ye fundamental paper hai, sab AI engineers ko pata hona chahiye.", recordedAt: randomDate(1.8, 1.6), durationSeconds: rand(95,150) },

    { text: "Shimla trip pe papa ne ek baat boli jo dil mein lagi — 'beta paise se zyada important hai ki raat ko chain ki neend aaye.' Matlab samjha unka. Job choose karna, startup karna — in sab decisions mein sirf money nahi, satisfaction bhi matter karta hai. Papa ki yahi simplicity mujhe sabse zyada inspire karti hai. Unke words sochta rehta hoon kabhi kabhi.", recordedAt: randomDate(0.2, 0.1), durationSeconds: rand(95,150) },

    { text: "Aaj Priya ne ek interesting observation share ki. Usne bola ki jo log sabse zyada succeed karte hain wo sabse smart nahi hote, sabse consistent hote hain. Maine ye quote save kiya apne notes mein. Kaafi resonated kiya — main consistently average raha hoon progress mein, koi overnight miracle nahi tha. Consistency ko aur seriously lena chahiye going forward.", recordedAt: randomDate(0.8, 0.6), durationSeconds: rand(85,135) },

    { text: "Aaj Amazon office mein ek all-hands meeting thi. CEO ne company direction bataya next year ke liye. AI integration har product mein hogi. Mujhe realization hua ki Smaran jaisa jo main build kar raha hoon, exactly isi direction mein hai industry. Timing is everything. Ishan ko raat ko bataya, wo bhi excited tha. Kal se development full speed.", recordedAt: randomDate(0.1, 0.0), durationSeconds: rand(100,155) },

    { text: "College ke pehle din ke baad 3 saal baad dekha toh — Rahul ab Microsoft mein hai, Priya Google mein, Arjun bhaiya ka startup Series A pe hai, main Amazon mein hoon. Teeno sabse common tha — uncertainty, hard work, aur ek dusre ka support. College mein sirf degree nahi mili, kuch such dost mile jinhone honestly meri zindagi better banayi.", recordedAt: randomDate(0.15, 0.05), durationSeconds: rand(110,165) },

  ];
}

// ─── MAIN SCRIPT ──────────────────────────────────────────
async function main() {
  console.log('🚀 Smaran Seed Script Starting...');
  console.log(`📍 Target: ${BASE_URL}`);

  // Step 1: Login
  console.log('\n🔑 Logging in...');
  const loginRes = await request('POST', '/api/auth/login', { email: EMAIL, password: PASSWORD });

  if (!loginRes.body.token) {
    console.log('Login failed, trying signup...');
    const signupRes = await request('POST', '/api/auth/signup', {
      email: EMAIL, password: PASSWORD,
      first_name: 'Naman', last_name: 'Test'
    });
    if (!signupRes.body.token) {
      console.error('❌ Auth failed:', JSON.stringify(signupRes.body));
      process.exit(1);
    }
    token = signupRes.body.token;
    console.log('✅ Signed up successfully');
  } else {
    token = loginRes.body.token;
    console.log('✅ Logged in successfully');
  }

  // Step 2: Seed memories
  const memories = getAllMemories();
  console.log(`\n📝 Seeding ${memories.length} memories...\n`);

  let success = 0;
  let failed  = 0;

  for (let i = 0; i < memories.length; i++) {
    const m = memories[i];
    try {
      const res = await request('POST', '/api/memory', m, token);
      if (res.body.id) {
        success++;
        console.log(`✅ [${i+1}/${memories.length}] saved — ${m.text.slice(0,60)}...`);
      } else {
        failed++;
        console.log(`❌ [${i+1}/${memories.length}] failed — ${JSON.stringify(res.body)}`);
      }
    } catch (err) {
      failed++;
      console.log(`❌ [${i+1}/${memories.length}] error — ${err.message}`);
    }
    await delay(DELAY_MS);
  }

  console.log(`\n🎉 Done! Success: ${success} | Failed: ${failed} | Total: ${memories.length}`);
}

let token = '';
main().catch(console.error);