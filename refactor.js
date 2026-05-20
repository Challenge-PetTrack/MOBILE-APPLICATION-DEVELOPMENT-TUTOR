const fs = require('fs');
const path = require('path');

const srcAppDir = path.join(__dirname, 'src', 'app');

const filesToMove = {
  // Auth
  'index.tsx': 'auth/login.tsx',
  'onboarding.tsx': 'auth/onboarding.tsx',
  'cadastro-usuario.tsx': 'auth/cadastro-usuario.tsx',
  
  // Tutor
  'tutor-home.tsx': 'tutor/home.tsx',
  'pet.tsx': 'tutor/pet.tsx',
  'agendar-consulta.tsx': 'tutor/agendar-consulta.tsx',
  'financeiro-tutor.tsx': 'tutor/financeiro.tsx',
  'ajustes-tutor.tsx': 'tutor/ajustes.tsx',
  'cadastro.tsx': 'tutor/cadastro-pet.tsx',
  'editar-pet.tsx': 'tutor/editar-pet.tsx',
  'faq.tsx': 'tutor/faq.tsx',
  'sac.tsx': 'tutor/sac.tsx',
  'medicamentos.tsx': 'tutor/medicamentos.tsx',
  'vacinas.tsx': 'tutor/vacinas.tsx',
  'score.tsx': 'tutor/score.tsx',
  'integrantes.tsx': 'tutor/integrantes.tsx',

  // Vet
  'vet-home.tsx': 'vet/home.tsx',
  'agenda-vet.tsx': 'vet/agenda.tsx',
  'financeiro-vet.tsx': 'vet/financeiro.tsx',
  'nova-consulta.tsx': 'vet/nova-consulta.tsx',
  'tutores-vet.tsx': 'vet/tutores.tsx',
  'ajustes-vet.tsx': 'vet/ajustes.tsx'
};

const routeMap = {
  "/": "/auth/login",
  "/onboarding": "/auth/onboarding",
  "/cadastro-usuario": "/auth/cadastro-usuario",
  
  "/tutor-home": "/tutor/home",
  "/pet": "/tutor/pet",
  "/agendar-consulta": "/tutor/agendar-consulta",
  "/financeiro-tutor": "/tutor/financeiro",
  "/ajustes-tutor": "/tutor/ajustes",
  "/cadastro": "/tutor/cadastro-pet",
  "/editar-pet": "/tutor/editar-pet",
  "/faq": "/tutor/faq",
  "/sac": "/tutor/sac",
  "/medicamentos": "/tutor/medicamentos",
  "/vacinas": "/tutor/vacinas",
  "/score": "/tutor/score",
  "/integrantes": "/tutor/integrantes",

  "/vet-home": "/vet/home",
  "/agenda-vet": "/vet/agenda",
  "/financeiro-vet": "/vet/financeiro",
  "/nova-consulta": "/vet/nova-consulta",
  "/tutores-vet": "/vet/tutores",
  "/ajustes-vet": "/vet/ajustes"
};

// Create dirs
['auth', 'tutor', 'vet'].forEach(dir => {
  const dirPath = path.join(srcAppDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Move files
for (const [oldName, newRelPath] of Object.entries(filesToMove)) {
  const oldPath = path.join(srcAppDir, oldName);
  const newPath = path.join(srcAppDir, newRelPath);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${oldName} -> ${newRelPath}`);
  }
}

// Function to recursively get all files
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });
  return arrayOfFiles;
}

const allTsxFiles = getAllFiles(srcAppDir).filter(f => f.endsWith('.tsx'));

// Refactor contents
allTsxFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace relative imports for context
  content = content.replace(/['"](\.\.\/)*context\/ThemeContext['"]/g, '"@/context/ThemeContext"');
  
  // Replace relative imports for assets
  content = content.replace(/require\(['"](\.\.\/)*assets\/(.*?)['"]\)/g, 'require("@/assets/$2")');

  // Replace route paths in router.push and router.replace
  // Handles cases like: router.push("/pet") or router.replace('/')
  content = content.replace(/(router\.(push|replace))\s*\(\s*['"](.*?)['"]\s*\)/g, (match, p1, p2, p3) => {
    // p3 is the route
    if (routeMap[p3]) {
      return `${p1}("${routeMap[p3]}")`;
    }
    // Also handle pathname objects if any (e.g. { pathname: '/pet' })
    return match;
  });

  // Handle object routes: router.push({ pathname: '/pet', params: ... })
  content = content.replace(/pathname:\s*['"](.*?)['"]/g, (match, p1) => {
    if (routeMap[p1]) {
      return `pathname: "${routeMap[p1]}"`;
    }
    return match;
  });
  
  // Replace direct Link hrefs if any: href="/pet"
  content = content.replace(/href=['"](.*?)['"]/g, (match, p1) => {
    if (routeMap[p1]) {
      return `href="${routeMap[p1]}"`;
    }
    return match;
  });

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Refactored ${file}`);
});

console.log("Refactoring complete.");
