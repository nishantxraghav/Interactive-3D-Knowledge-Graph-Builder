document.addEventListener("DOMContentLoaded", () => {

let mode = "developer";
let barChart = null;
let graphInstance = null;

const loading = document.getElementById("loading");

const avatar = document.getElementById("avatar");
const nameEl = document.getElementById("name");
const bio = document.getElementById("bio");

const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const readinessEl = document.getElementById("readiness");

const aiInsights = document.getElementById("aiInsights");
const growthPanel = document.getElementById("growthPanel");
const badges = document.getElementById("badges");
const bestRepo = document.getElementById("bestRepo");
const domainPanel = document.getElementById("domainPanel");

const barCanvas = document.getElementById("barChart");

window.toggleMode = function(){
  mode = mode === "developer" ? "recruiter" : "developer";
  document.querySelector(".mode-btn").innerText =
    mode === "developer" ? "Switch to Recruiter" : "Switch to Developer";
}

window.analyze = async function(){

  loading.style.display="block";

  try{

    const input = document.getElementById("username").value.trim();
    if(!input) throw "Enter username";

    const users = input.split(",");

    if(users.length > 1){
      await teamAnalyze(users);
      loading.style.display="none";
      return;
    }

    const user = users[0];

    const profile = await fetch(`https://api.github.com/users/${user}`).then(r=>r.json());
    if(profile.message) throw "User not found";

    const repos = await fetch(`https://api.github.com/users/${user}/repos?per_page=100`).then(r=>r.json());

    renderProfile(profile);

    const skills = extractSkills(repos);

    generateScore(profile, skills);
    generateBadges(profile, repos);
    showBestRepo(repos);
    showDomain(skills);
    renderChart(skills);
    renderGraph(user, repos);
    generateAIInsights(profile, skills, repos);
    generateGrowthPrediction(profile, repos);

  }catch(err){
    alert(err);
  }

  loading.style.display="none";
}

function renderProfile(p){
  avatar.src = p.avatar_url || "";
  nameEl.innerText = p.name || p.login || "";
  bio.innerText = p.bio || "";
}

function extractSkills(repos){
  const skills = {};
  repos.forEach(r=>{
    if(r.language) skills[r.language]=(skills[r.language]||0)+1;
  });
  return skills;
}

function generateScore(p,skills){

  let score = Math.min(100,
    Math.floor(p.public_repos*2 + p.followers*1.5 + Object.keys(skills).length*5)
  );

  scoreEl.innerText = score;
  levelEl.innerText = score > 70 ? "Architect" : "Builder";

  readinessEl.innerText =
    mode === "recruiter"
      ? "Hiring Recommendation: " + (score > 60 ? "YES" : "NO")
      : "AI Engineer Readiness: " + (skills["Python"] ? "70%" : "40%");
}

function generateBadges(p,repos){

  badges.innerHTML = "<h3>Badges</h3>";

  if(repos.length > 15) badges.innerHTML += "🚀 Mega Builder<br>";
  if(p.followers > 30) badges.innerHTML += "⭐ Influencer<br>";
}

function showBestRepo(repos){

  if(!repos.length){
    bestRepo.innerHTML = "No repositories";
    return;
  }

  const top = repos.sort((a,b)=>b.stargazers_count-a.stargazers_count)[0];

  bestRepo.innerHTML = `
    <h3>Best Project</h3>
    ${top.name}<br>
    ⭐ ${top.stargazers_count}
  `;
}

function showDomain(skills){

  let frontend=0, backend=0, ai=0;

  for(let lang in skills){
    if(["HTML","CSS","JavaScript"].includes(lang)) frontend+=skills[lang];
    if(["Python","Java","C#"].includes(lang)) backend+=skills[lang];
    if(lang==="Python") ai+=skills[lang];
  }

  domainPanel.innerHTML = `
    <h3>Domain</h3>
    Frontend: ${frontend}<br>
    Backend: ${backend}<br>
    AI: ${ai}
  `;
}

function renderChart(skills){

  const labels = Object.keys(skills);
  const data = Object.values(skills);

  if(barChart) barChart.destroy();

  barChart = new Chart(barCanvas,{
    type:"bar",
    data:{labels,datasets:[{data,backgroundColor:"#00ffd5"}]}
  });
}

function renderGraph(user,repos){

  if(graphInstance){
    graphInstance._destructor();
  }

  const nodes=[{id:user,group:1,val:12}];
  const links=[];

  repos.forEach(r=>{
    nodes.push({id:r.name,group:2,val:5});
    links.push({source:user,target:r.name});
  });

  graphInstance = ForceGraph()(document.getElementById("graph"))
    .graphData({nodes,links})
    .nodeAutoColorBy("group")
    .backgroundColor("#000");
}

async function teamAnalyze(users){

  domainPanel.innerHTML = "<h3>Team Coverage</h3>";

  for(let u of users){

    const repos = await fetch(`https://api.github.com/users/${u.trim()}/repos`).then(r=>r.json());

    domainPanel.innerHTML += `${u} → ${repos.length} repos<br>`;
  }
}

function generateAIInsights(profile,skills,repos){

  aiInsights.innerHTML = `
    <h3>AI Insights</h3>
    Strongest skill: ${Object.keys(skills)[0] || "None"}<br>
    Total repos: ${repos.length}<br>
    Followers: ${profile.followers}
  `;
}

function generateGrowthPrediction(profile,repos){

  const growth = repos.length*2 + profile.followers;

  growthPanel.innerHTML = `
    <h3>Growth Prediction</h3>
    <h2>${growth}+</h2>
    6 month projected score
  `;
}

});
