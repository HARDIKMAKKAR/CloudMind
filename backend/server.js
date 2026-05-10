const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { exec } = require("child_process");

const simpleGit = require("simple-git");
const fs = require("fs");
const path = require("path");

const git = simpleGit();

const Docker = require("dockerode");

const docker = new Docker({
  socketPath: "/var/run/docker.sock"
});

// const getPort = require("get-port");

// const port = await getPort({ port: getPort.makeRange(3001, 4000) });
const app = express();

app.use(cors());
app.use(express.json());

/* -----------------------------
   LOCAL STORAGE (REPLACES AWS)
----------------------------- */

let services = [];

/* -----------------------------
   GET ALL SERVICES
----------------------------- */

app.get('/services', (req, res) => {
  res.json(services);
});


/* -----------------------------
   DEPLOY SERVICE
----------------------------- */
app.post("/deploy", async (req, res) => {
  let { repoUrl, projectName } = req.body;

  if (!repoUrl || !projectName) {
    return res.status(400).json({ error: "Missing repoUrl or projectName" });
  }

  // ❌ Block invalid GitHub URLs
  if (repoUrl.includes("/tree/")) {
    return res.status(400).json({
      error: "Invalid GitHub URL. Use root repo link."
    });
  }

  // ✅ Auto-fix .git
  if (!repoUrl.endsWith(".git")) {
    repoUrl += ".git";
  }

  // 🔥 REMOVE OLD ENTRY
  services = services.filter(s => s.name !== projectName);

  // 🔥 ADD NEW
  services.push({
    serviceId: null,
    name: projectName,
    repoUrl,
    port: null,
    status: "deploying",
    replicas: 1
  });

  res.json({
    message: "Deployment started 🚀",
    projectName
  });

  deployProject(repoUrl, projectName);
});



async function deployProject(repoUrl, projectName) {
  try {
    const projectPath = path.join(__dirname, "projects", projectName);

    if (fs.existsSync(projectPath)) {
      fs.rmSync(projectPath, { recursive: true, force: true });
    }

    console.log("Cloning repo...");

    if (!repoUrl.endsWith(".git")) {
  repoUrl = repoUrl + ".git";
}

    if (repoUrl.includes("/tree/")) {
  throw new Error("Invalid repo URL. Use root GitHub repo link.");
}


    await cloneRepo(repoUrl, projectPath);

    const type = detectProjectType(projectPath);

    generateDockerfile(projectPath, type);

    console.log("Building image...");
    await buildImage(projectPath, projectName);

    // const getPort = (await import("get-port")).default;
    // const port = await getPort({
    //   port: getPort.makeRange(3001, 4000)
    // });


    const getPort = (await import("get-port")).default;

const port = await getPort();

    console.log("Starting container...");
    const containerId = await runContainer(projectName, projectName, port, type);

    // ✅ UPDATE EXISTING SERVICE
    const service = services.find(s => s.name === projectName);

    if (service) {
      service.serviceId = containerId;
      service.port = port;
      service.status = "running";
    }

    console.log("✅ Deployment completed:", projectName);

  } catch (err) {
    console.error("❌ Deployment failed:", err);

    const service = services.find(s => s.name === projectName);

if (service) {
  service.status = "failed";
  service.error = err.message;
}
  }
}

/* -----------------------------
   GENERATE METRICS
----------------------------- */


async function buildImage(projectPath, imageName) {
  return new Promise((resolve, reject) => {
    docker.buildImage(
      {
        context: projectPath,
        src: ["."]
      },
      { t: imageName },
      (err, stream) => {
        if (err) return reject(err);

        docker.modem.followProgress(stream, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      }
    );
  });
}

function cloneRepo(repoUrl, projectPath) {
  return new Promise((resolve, reject) => {
    exec(`git clone ${repoUrl} ${projectPath}`, (error, stdout, stderr) => {
      if (error) {
        return reject(stderr || error.message);
      }
      resolve(stdout);
    });
  });
}

async function runContainer(imageName, containerName, port, type) {
  const containerPort = type === "python" ? "5000/tcp" : "3000/tcp";

  const container = await docker.createContainer({
    Image: imageName,
    name: containerName,
    ExposedPorts: {
      [containerPort]: {}
    },
    HostConfig: {
      PortBindings: {
        [containerPort]: [{ HostPort: `${port}` }]
      }
    }
  });

  await container.start();
  return container.id;
}

function detectProjectType(projectPath) {
  const fs = require("fs");

  if (fs.existsSync(`${projectPath}/package.json`)) {
    return "node";
  }

  if (fs.existsSync(`${projectPath}/requirements.txt`)) {
    return "python";
  }

  return "unknown";
}


function generateDockerfile(projectPath, type) {
  let dockerfile = "";

  if (type === "node") {
    const startCmd = getStartCommand(projectPath);

    dockerfile = `
FROM node:18
WORKDIR /app
COPY . .
RUN npm install

ENV PORT=3000
EXPOSE 3000

CMD ["sh", "-c", "HOST=0.0.0.0 PORT=3000 ${startCmd}"]
`;
  } 
  else if (type === "python") {
    const pythonCmd = getPythonStartCommand(projectPath);

    dockerfile = `
FROM python:3.10
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt

ENV PORT=5000
EXPOSE 5000

CMD ${JSON.stringify(pythonCmd)}
`;
  } 
  else {
    throw new Error("Unsupported project type");
  }

  fs.writeFileSync(path.join(projectPath, "Dockerfile"), dockerfile);
}

function generateMetrics() {
  return {
    cpu: Math.floor(Math.random() * 100),
    memory: Math.floor(Math.random() * 100),
    latency: Math.floor(Math.random() * 200)
  };
}
function getStartCommand(projectPath) {
  const pkgPath = path.join(projectPath, "package.json");

  if (!fs.existsSync(pkgPath)) {
    throw new Error("package.json not found");
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

  if (pkg.scripts) {
    if (pkg.scripts.start) return "npm start";
    if (pkg.scripts.dev) return "npm run dev";
  }

  // 🔥 SMART FALLBACKS
  if (fs.existsSync(path.join(projectPath, "index.js"))) {
    return "node index.js";
  }

  if (fs.existsSync(path.join(projectPath, "app.js"))) {
    return "node app.js";
  }

  throw new Error("No valid start command found");
}

function getPythonStartCommand(projectPath) {
  const fs = require("fs");
  const path = require("path");

  if (fs.existsSync(path.join(projectPath, "app.py"))) {
    return ["python", "app.py"];
  }

  if (fs.existsSync(path.join(projectPath, "main.py"))) {
    return ["python", "main.py"];
  }

  // fallback
  return ["python", "app.py"];
}

/* -----------------------------
   CLOUDMIND INTELLIGENCE
----------------------------- */

app.get('/intelligence/:serviceId', async (req, res) => {

  const serviceId = req.params.serviceId;

  const metrics = generateMetrics();

  try {

    // 🔥 IMPORTANT: Use Docker service name
    const mlResponse = await axios.post(
      "http://ml-service:5000/predict",
      metrics
    );

    const intelligence = mlResponse.data;

    // Apply scaling decision
    if (intelligence.scaling_decision !== "no_action") {
      applyScaling(serviceId, intelligence.scaling_decision);
    }

    res.json({
      serviceId,
      metrics,
      intelligence
    });

  } catch (error) {

    res.status(500).json({
      error: "ML service error",
      details: error.message
    });

  }

});


/* -----------------------------
   UPDATE SERVICE STATUS
----------------------------- */

function updateServiceStatus(serviceId, status) {

  const service = services.find(s => s.serviceId === serviceId);

  if (service) {
    service.status = status;
  }

}


/* -----------------------------
   APPLY SCALING
----------------------------- */

function applyScaling(serviceId, action) {

  const service = services.find(s => s.serviceId === serviceId);

  if (!service) return;

  if (action === "scale_up") {
    service.replicas += 1;
  }

  if (action === "scale_down" && service.replicas > 1) {
    service.replicas -= 1;
  }

}


/* -----------------------------
   START SERVER
----------------------------- */

const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CloudMind backend running on port ${PORT}`);
});