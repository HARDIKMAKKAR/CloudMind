const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { exec } = require("child_process");

const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");

const User = require("./models/User");

const JWT_SECRET = "cloudmind_secret_key";

const Service = require("./models/Service");

const auth = require("./middleware/auth");

const Log = require("./models/Log");
const Metric = require("./models/Metric");

const createAutoScaler =
  require("./services/autoscaler");



const simpleGit = require("simple-git");
const fs = require("fs");
const path = require("path");

const git = simpleGit();
const crypto = require("crypto");

global.crypto = crypto;

const mongoose = require("mongoose");
const Docker = require("dockerode");

const docker = new Docker({
  socketPath: "/var/run/docker.sock"
});

// const getPort = require("get-port");

// const port = await getPort({ port: getPort.makeRange(3001, 4000) });
const app = express();

const {
  startAutoScaler
} = createAutoScaler(

  runContainer,

  docker

);

mongoose.connect("mongodb://mongodb:27017/cloudmind")
  .then(() => {
    console.log("MongoDB connected");
    startAutoScaler();
  })
  .catch(err => {
    console.log(err);
  });

app.use(cors());
app.use(express.json());

/* -----------------------------
   LOCAL STORAGE (REPLACES AWS)
----------------------------- */

// let services = [];
// let deploymentLogs = {};
/* -----------------------------
   GET ALL SERVICES
----------------------------- */

// app.get('/services', (req, res) => {
//   res.json(services);
// });


app.post(
  "/auth/register",
  async (req, res) => {
    try {
      const {
        name,
        email,
        password
      } = req.body;
      /* -----------------------------
         VALIDATION
      ----------------------------- */
      if (
        !name ||
        !email ||
        !password
      ) {
        return res.status(400).json({
          error:
            "All fields required"
        });
      }
      /* -----------------------------
         CHECK EXISTING USER
      ----------------------------- */
      const existingUser =
        await User.findOne({
          email
        });
      if (existingUser) {
        return res.status(400).json({
          error:
            "User already exists"
        });
      }
      /* -----------------------------
         HASH PASSWORD
      ----------------------------- */
      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );
      /* -----------------------------
         CREATE USER
      ----------------------------- */
      const user =
        await User.create({
          name,
          email,
          password:
            hashedPassword
        });
      /* -----------------------------
         GENERATE TOKEN
      ----------------------------- */
      const token =
        jwt.sign(
          {
            id: user._id
          },
          JWT_SECRET,
          {
            expiresIn: "7d"
          }
        );
      /* -----------------------------
         RESPONSE
      ----------------------------- */
      res.json({
        message:
          "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);



app.post(
  "/auth/login",
  async (req, res) => {
    try {
      const {
        email,
        password
      } = req.body;
      /* -----------------------------
         VALIDATION
      ----------------------------- */
      if (
        !email ||
        !password
      ) {
        return res.status(400).json({
          error:
            "Email and password required"
        });
      }
      /* -----------------------------
         FIND USER
      ----------------------------- */
      const user =
        await User.findOne({
          email
        });
      if (!user) {
        return res.status(400).json({
          error:
            "Invalid credentials"
        });
      }
      /* -----------------------------
         CHECK PASSWORD
      ----------------------------- */
      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );
      if (!isMatch) {
        return res.status(400).json({
          error:
            "Invalid credentials"
        });
      }
      /* -----------------------------
         GENERATE JWT
      ----------------------------- */
      const token =
        jwt.sign(
          {
            id: user._id
          },
          JWT_SECRET,
          {
            expiresIn: "7d"
          }
        );
     /* -----------------------------
         RESPONSE
     ----------------------------- */
      res.json({
        message:
          "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);







app.get('/services', auth ,async (req, res) => {
  try {
    const services =
      await Service.find({
  user: req.user._id
}).sort({
        createdAt: -1
      });
    res.json(services);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});


app.get("/test-db", async (req, res) => {

  const service = await Service.create({
    serviceId: "test123",
    name: "test-service",
    repoUrl: "github.com/test",
    port: 3001,
    status: "running",
    replicas: 1
  });

  res.json(service);

});

// app.get("/logs/:projectName", (req, res) => {

//   const { projectName } = req.params;

//   res.json(
//     deploymentLogs[projectName] || []
//   );

// });

app.get(
  "/logs/:projectName",auth,
  async (req, res) => {

    try {

      const service =
  await Service.findOne({
    name: req.params.projectName,
    user: req.user._id
  });

if (!service) {
  return res.status(404).json({
    error: "Access denied"
  });
}

      const logs =
        await Log.find({
          projectName:
            req.params.projectName
        }).sort({
          timestamp: 1
        });

      res.json(logs);

    } catch (err) {

      res.status(500).json({
        error: err.message
      });

    }

  }
);

app.get(
  "/metrics/:serviceId",auth,
  async (req, res) => {
    try {

      const service =
  await Service.findOne({
    serviceId: req.params.serviceId,
    user: req.user._id
  });

if (!service) {
  return res.status(404).json({
    error: "Access denied"
  });
}

      const metrics =
        await Metric.find({
          serviceId:
            req.params.serviceId
        })
        .sort({
          timestamp: -1
        })
        .limit(50);
      res.json(metrics);
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);


// app.post(
//   "/stop/:serviceId",auth,
//   async (req, res) => {
//     try {
//       const { serviceId } =
//         req.params;
//       /* -----------------------------
//          FIND SERVICE
//       ----------------------------- */
//       const service =
//         await Service.findOne({
//   serviceId,
//   user: req.user._id
// });
//       if (!service) {
//         return res.status(404).json({
//           error: "Service not found"
//         });
//       }
//       /* -----------------------------
//          STOP CONTAINER
//       ----------------------------- */
//       const container =
//         docker.getContainer(serviceId);
//       await container.stop();
//       /* -----------------------------
//          UPDATE DATABASE
//       ----------------------------- */
//       service.status = "stopped";
//       await service.save();
//       /* -----------------------------
//          SAVE LOG
//       ----------------------------- */
//       await addLog(
//         service.name,
//         "Container stopped successfully",
//         "info"
//       );
//       /* -----------------------------
//          RESPONSE
//       ----------------------------- */
//       res.json({
//         message:
//           "Service stopped successfully"
//       });
//     } catch (err) {
//       res.status(500).json({
//         error: err.message
//       });
//     }
//   }
// );
app.post(
  "/stop/:serviceId",
  auth,
  async (req, res) => {

    try {

      const { serviceId } =
        req.params;

      /* -----------------------------
         FIND SERVICE
      ----------------------------- */

      const service =
        await Service.findOne({

          serviceId,

          user: req.user._id

        });

      if (!service) {

        return res.status(404).json({

          error:
            "Service not found"

        });

      }

      /* -----------------------------
         STOP ALL CONTAINERS
      ----------------------------- */

      if (
        service.containers &&
        service.containers.length > 0
      ) {

        for (
          const replica
          of service.containers
        ) {

          try {

            const container =
              docker.getContainer(
                replica.containerId
              );

            await container.stop();

            replica.status =
              "stopped";

            console.log(
              `Stopped container: ${replica.containerId}`
            );

          }

          catch (err) {

            console.log(
              `Container already stopped: ${replica.containerId}`
            );

          }

        }

      }

      /* -----------------------------
         UPDATE DATABASE
      ----------------------------- */

      service.status =
        "stopped";

      await service.save();

      /* -----------------------------
         SAVE LOG
      ----------------------------- */

      await addLog(

        service.name,

        "Service stopped successfully",

        "info"

      );

      /* -----------------------------
         RESPONSE
      ----------------------------- */

      res.json({

        message:
          "Service stopped successfully"

      });

    }

    catch (err) {

      res.status(500).json({

        error: err.message

      });

    }

  }
);

// app.post(
//   "/restart/:serviceId",auth,
//   async (req, res) => {
//     try {
//       const { serviceId } =
//         req.params;
//       /* -----------------------------
//          FIND SERVICE
//       ----------------------------- */
//       const service =
//         await Service.findOne({
//   serviceId,
//   user: req.user._id
// });
//       if (!service) {
//         return res.status(404).json({
//           error: "Service not found"
//         });
//       }
//       /* -----------------------------
//          RESTART CONTAINER
//       ----------------------------- */
//       const container =
//         docker.getContainer(serviceId);
//       await container.restart();
//       /* -----------------------------
//          UPDATE STATUS
//       ----------------------------- */
//       service.status = "running";
//       await service.save();
//       /* -----------------------------
//          SAVE LOG
//       ----------------------------- */
//       await addLog(
//         service.name,
//         "Container restarted successfully",
//         "info"
//       );
//       /* -----------------------------
//          RESPONSE
//       ---------------------------- */
//       res.json({
//         message:
//           "Service restarted successfully"
//       });
//     } catch (err) {
//       res.status(500).json({
//         error: err.message
//       });
//     }
//   }
// );
app.post(
  "/restart/:serviceId",
  auth,
  async (req, res) => {

    try {

      const { serviceId } =
        req.params;

      /* -----------------------------
         FIND SERVICE
      ----------------------------- */

      const service =
        await Service.findOne({

          serviceId,

          user: req.user._id

        });

      if (!service) {

        return res.status(404).json({

          error:
            "Service not found"

        });

      }

      /* -----------------------------
         RESTART ALL CONTAINERS
      ----------------------------- */

      if (
        service.containers &&
        service.containers.length > 0
      ) {

        for (
          const replica
          of service.containers
        ) {

          try {

            const container =
              docker.getContainer(
                replica.containerId
              );

            await container.restart();

            replica.status =
              "running";

            console.log(
              `Restarted container: ${replica.containerId}`
            );

          }

          catch (err) {

            console.log(
              `Container restart failed: ${replica.containerId}`
            );

          }

        }

      }

      /* -----------------------------
         UPDATE DATABASE
      ----------------------------- */

      service.status =
        "running";

      await service.save();

      /* -----------------------------
         SAVE LOG
      ----------------------------- */

      await addLog(

        service.name,

        "Service restarted successfully",

        "info"

      );

      /* -----------------------------
         RESPONSE
      ----------------------------- */

      res.json({

        message:
          "Service restarted successfully"

      });

    }

    catch (err) {

      res.status(500).json({

        error: err.message

      });

    }

  }
);

// app.delete(
//   "/service/:serviceId",auth,
//   async (req, res) => {
//     try {
//       const { serviceId } =
//         req.params;
//       /* -----------------------------
//          FIND SERVICE
//       ----------------------------- */
//       const service =
//         await Service.findOne({
//   serviceId,
//   user: req.user._id
// });
//       if (!service) {
//         return res.status(404).json({
//           error: "Service not found"
//         });
//       }
//       /* -----------------------------
//          REMOVE CONTAINER
//       ----------------------------- */
//       try {
//         const container =
//           docker.getContainer(serviceId);
//         await container.remove({
//           force: true
//         });
//       } catch (err) {
//         console.log(
//           "Container already removed"
//         );
//       }
//       /* -----------------------------
//          REMOVE PROJECT FILES
//       ----------------------------- */
//       const projectPath =
//         path.join(
//           __dirname,
//           "projects",
//           service.name
//         );
//       if (
//         fs.existsSync(projectPath)
//       ) {
//         fs.rmSync(
//           projectPath,
//           {
//             recursive: true,
//             force: true
//           }
//         );
//       }
//       /* -----------------------------
//          REMOVE DATABASE RECORDS
//       ----------------------------- */
//       await Service.deleteOne({
//         serviceId
//       });
//       await Log.deleteMany({
//         projectName:
//           service.name
//       });
//       await Metric.deleteMany({
//         serviceId
//       });
//       /* -----------------------------
//          RESPONSE
//       ----------------------------- */
//       res.json({
//         message:
//           "Service deleted successfully"
//       });
//     } catch (err) {
//       res.status(500).json({
//         error: err.message
//       });
//     }
//   }
// );


app.delete(
  "/service/:serviceId",
  auth,
  async (req, res) => {

    try {

      const { serviceId } =
        req.params;

      /* -----------------------------
         FIND SERVICE
      ----------------------------- */

      const service =
        await Service.findOne({

          serviceId,

          user: req.user._id

        });

      if (!service) {

        return res.status(404).json({

          error:
            "Service not found"

        });

      }

      /* -----------------------------
         REMOVE ALL CONTAINERS
      ----------------------------- */

      if (
        service.containers &&
        service.containers.length > 0
      ) {

        for (
          const replica
          of service.containers
        ) {

          try {

            const container =
              docker.getContainer(
                replica.containerId
              );

            await container.remove({

              force: true

            });

            console.log(
              `Removed container: ${replica.containerId}`
            );

          }

          catch (err) {

            console.log(
              `Container already removed: ${replica.containerId}`
            );

          }

        }

      }

      /* -----------------------------
         REMOVE PROJECT FILES
      ----------------------------- */

      const projectPath =
        path.join(

          __dirname,

          "projects",

          service.name

        );

      if (
        fs.existsSync(projectPath)
      ) {

        fs.rmSync(

          projectPath,

          {

            recursive: true,

            force: true

          }

        );

      }

      /* -----------------------------
         REMOVE DATABASE RECORDS
      ----------------------------- */

      await Service.deleteOne({

        _id: service._id

      });

      await Log.deleteMany({

        projectName:
          service.name

      });

      await Metric.deleteMany({

        serviceId:
          service.serviceId

      });

      /* -----------------------------
         RESPONSE
      ----------------------------- */

      res.json({

        message:
          "Service deleted successfully"

      });

    }

    catch (err) {

      res.status(500).json({

        error: err.message

      });

    }

  }
);
app.get(
  "/container-logs/:serviceId",auth,
  async (req, res) => {
    try {
      const { serviceId } =
        req.params;
      /* -----------------------------
         FIND SERVICE
      ----------------------------- */
      const service =
        await Service.findOne({
  serviceId,
  user: req.user._id
});
      if (!service) {
        return res.status(404).json({
          error: "Service not found"
        });
      }
      /* -----------------------------
         GET CONTAINER
      ----------------------------- */
      const container =
        docker.getContainer(serviceId);
      /* -----------------------------
         FETCH LOGS
      ----------------------------- */
      const logs =
        await container.logs({
          stdout: true,
          stderr: true,
          tail: 100
        });
      /* -----------------------------
         RESPONSE
      ----------------------------- */
      res.json({
        service: service.name,
        logs: logs.toString()
      });
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);




app.get("/monitor/:serviceId", auth,async (req, res) => {
  try {
    const { serviceId } = req.params;
    /* -----------------------------
       FIND SERVICE
    ----------------------------- */
    const service =
      await Service.findOne({
  serviceId,
  user: req.user._id
});
    if (!service) {
      return res.status(404).json({
        error: "Service not found"
      });
    }
    /* -----------------------------
       GET CONTAINER STATUS
    ----------------------------- */
    const status =
      await getContainerStatus(serviceId);
    // Save latest status
    service.status = status.status;
    await service.save();
    /* -----------------------------
       GET METRICS
    ----------------------------- */
    const metrics =
      await getContainerMetrics(serviceId);
    /* -----------------------------
       SAVE METRICS HISTORY
    ----------------------------- */
    await Metric.create({
      serviceId,
      cpu: Number(metrics.cpu),
      memory: Number(metrics.memory),
      latency:
        Math.floor(Math.random() * 200)
    });
    /* -----------------------------
       RESPONSE
    ----------------------------- */
    res.json({
      service: service.name,
      status,
      metrics
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});
/* -----------------------------
   DEPLOY SERVICE
----------------------------- */
app.post("/deploy",auth, async (req, res) => {

  let { repoUrl, projectName } = req.body;

  if (!repoUrl || !projectName) {

    return res.status(400).json({
      error: "Missing repoUrl or projectName"
    });

  }

  // Block invalid GitHub URLs
  if (repoUrl.includes("/tree/")) {

    return res.status(400).json({
      error:
        "Invalid GitHub URL. Use root repo link."
    });

  }

  // Auto-add .git
  if (!repoUrl.endsWith(".git")) {
    repoUrl += ".git";
  }

  // Instant response
  res.json({
    message: "Deployment started 🚀",
    projectName
  });

  // Background deployment
  deployProject(repoUrl, projectName,req.user._id);

});

async function addLog(
  projectName,
  message,
  level = "info"
) {
  await Log.create({
    projectName,
    message,
    level
  });

}


// async function deployProject(repoUrl, projectName,userId) {
//   try {
//     const projectPath =
//       path.join(__dirname, "projects", projectName);
//     // Remove old project for redeploy
//     if (fs.existsSync(projectPath)) {
//       fs.rmSync(
//         projectPath,
//         {
//           recursive: true,
//           force: true
//         }
//       );
//     }
//     // Validate repo URL
//     if (repoUrl.includes("/tree/")) {
//       throw new Error(
//         "Invalid repo URL. Use root GitHub repo link."
//       );

//     }
//     // Auto-add .git
//     if (!repoUrl.endsWith(".git")) {
//       repoUrl += ".git";
//     }
//     /* ----------------------------
//        CLONE REPOSITORY
//     ----------------------------- */
//     console.log("Cloning repo...");
//     await addLog(
//       projectName,
//       "Cloning repository..."
//     );
//     await cloneRepo(
//       repoUrl,
//       projectPath
//     );
//     await addLog(
//       projectName,
//       "Repository cloned successfully"
//     );
//     /* -----------------------------
//        DETECT PROJECT TYPE
//     ----------------------------- */
//     const type =
//       detectProjectType(projectPath);
//     await addLog(
//       projectName,
//       `Detected project type: ${type}`
//     );
//     /* -----------------------------
//        GENERATE DOCKERFILE
//     ----------------------------- */
//     generateDockerfile(
//       projectPath,
//       type
//     );
//     await addLog(
//       projectName,
//       "Dockerfile generated"
//     );
//     /* -----------------------------
//        BUILD IMAGE
//     ---------------------------- */
//     console.log("Building image...");
//     await addLog(
//       projectName,
//       "Building Docker image..."
//     );
//     // await buildImage(
//     //   projectPath,
//     //   projectName
//     // );
//     await buildImage(
//   projectPath,
//   projectName,
//   projectName
// );
//     await addLog(
//       projectName,
//       "Docker image built successfully"
//     );
//     /* -----------------------------
//        GET AVAILABLE PORT
//     ---------------------------- */
//     const getPort =
//       (await import("get-port")).default;
//     const port = await getPort();
//     await addLog(
//       projectName,
//       `Allocated port: ${port}`
//     );
//     /* -----------------------------
//        START CONTAINER
//     ----------------------------- */
//     console.log("Starting container...");
//     await addLog(
//       projectName,
//       "Starting container..."
//     );

//     await removeOldContainer(projectName);

//     const containerId =
//       await runContainer(
//         projectName,
//         projectName,
//         port,
//         type
//       );
//     await addLog(
//       projectName,
//       "Container started successfully"
//     );
//     /* -----------------------------
//        SAVE SERVICE TO DATABASE
//     ----------------------------- */
//     await Service.deleteMany({
//   name: projectName
// });


//     await Service.create({
//       user: userId,
//       serviceId: containerId,
//       name: projectName,
//       repoUrl,
//       port,
//       status: "running",
//       replicas: 1
//     });
//     /* -----------------------------
//        SUCCESS
//     ----------------------------- */
//     console.log(
//       "✅ Deployment completed:",
//       projectName
//     );
//     await addLog(
//       projectName,
//       "Deployment completed successfully",
//       "success"
//     );
//   } catch (err) {
//     console.error(
//       "❌ Deployment failed:",
//       err
//     );
//     /* -----------------------------
//        SAVE FAILURE LOG
//     ----------------------------- */
//     await addLog(
//       projectName,
//       `Deployment failed: ${err.message}`,
//       "error"
//     );
//     /* -----------------------------
//        UPDATE / CREATE FAILED SERVICE
//     ----------------------------- */
//     const existingService =
//       await Service.findOne({
//         name: projectName
//       });
//     if (existingService) {
//       existingService.status = "failed";
//       existingService.error =
//         err.message;
//       await existingService.save();
//     } else {

//       await Service.deleteMany({
//   name: projectName
// });

//       await Service.create({
//         user: userId,
//         serviceId: null,
//         name: projectName,
//         repoUrl,
//         port: null,
//         status: "failed",
//         replicas: 1,
//         error: err.message
//       });
//     }
//   }
// }

async function deployProject(
  repoUrl,
  projectName,
  userId
) {

  try {

    const projectPath =
      path.join(
        __dirname,
        "projects",
        projectName
      );

    /* -----------------------------
       CREATE INITIAL SERVICE
    ----------------------------- */

    await Service.deleteMany({

      name: projectName,

      user: userId

    });

    // await Service.create({

    //   user: userId,

    //   serviceId: null,

    //   name: projectName,

    //   repoUrl,

    //   port: null,

    //   status: "deploying",

    //   replicas: 1

    // });

    await Service.create({

  user: userId,

  serviceId: null,

  name: projectName,

  repoUrl,

  port: null,

  type: null,

  status: "deploying",

  replicas: 1,

  containers: [],

  error: null

});

    /* -----------------------------
       REMOVE OLD PROJECT
    ----------------------------- */

    if (fs.existsSync(projectPath)) {

      fs.rmSync(
        projectPath,
        {
          recursive: true,
          force: true
        }
      );

    }

    /* -----------------------------
       VALIDATE REPO URL
    ----------------------------- */

    if (repoUrl.includes("/tree/")) {

      throw new Error(
        "Invalid repo URL. Use root GitHub repo link."
      );

    }

    /* -----------------------------
       AUTO ADD .git
    ----------------------------- */

    if (!repoUrl.endsWith(".git")) {

      repoUrl += ".git";

    }

    /* -----------------------------
       CLONE REPOSITORY
    ----------------------------- */

    console.log(
      "Cloning repo..."
    );

    await addLog(
      projectName,
      "Cloning repository..."
    );

    await cloneRepo(
      repoUrl,
      projectPath
    );

    await addLog(
      projectName,
      "Repository cloned successfully"
    );

    /* -----------------------------
       DETECT PROJECT TYPE
    ----------------------------- */

    const type =
      detectProjectType(
        projectPath
      );

    await addLog(
      projectName,
      `Detected project type: ${type}`
    );

    /* -----------------------------
       GENERATE DOCKERFILE
    ----------------------------- */

    generateDockerfile(
      projectPath,
      type
    );

    await addLog(
      projectName,
      "Dockerfile generated"
    );

    /* -----------------------------
       BUILD IMAGE
    ----------------------------- */

    console.log(
      "Building image..."
    );

    await addLog(
      projectName,
      "Building Docker image..."
    );

    await buildImage(
      projectPath,
      projectName,
      projectName
    );

    await addLog(
      projectName,
      "Docker image built successfully"
    );

    /* -----------------------------
       GET AVAILABLE PORT
    ----------------------------- */

    const getPort =
      (
        await import("get-port")
      ).default;

    const port =
      await getPort();

    await addLog(
      projectName,
      `Allocated port: ${port}`
    );

    /* -----------------------------
       START CONTAINER
    ----------------------------- */

    console.log(
      "Starting container..."
    );

    await addLog(
      projectName,
      "Starting container..."
    );

    await removeOldContainer(
      projectName
    );

    const containerId =
      await runContainer(

        projectName,

        projectName,

        port,

        type

      );

    await addLog(
      projectName,
      "Container started successfully"
    );

    /* -----------------------------
       UPDATE SERVICE
    ----------------------------- */

    // await Service.findOneAndUpdate(

    //   {

    //     name: projectName,

    //     user: userId

    //   },

    //   {

    //     serviceId:
    //       containerId,

    //     port,

    //     status:
    //       "running"

    //   }

    // );
// await Service.findOneAndUpdate(

//   {

//     name: projectName,

//     user: userId

//   },

//   {

//     serviceId: containerId,

//     port,

//     type,

//     status: "running",

//     containers: [

//       {

//         containerId,

//         port,

//         status: "running"

//       }

//     ]

//   }

// );

await Service.findOneAndUpdate(

  {

    name: projectName,

    user: userId

  },

  {

    serviceId: containerId,

    port,

    type,

    status: "running",

    replicas: 1,

    containers: [

      {

        containerId,

        port,

        status: "running"

      }

    ]

  }

);
    /* -----------------------------
       SUCCESS
    ----------------------------- */

    console.log(
      "✅ Deployment completed:",
      projectName
    );

    await addLog(

      projectName,

      "Deployment completed successfully",

      "success"

    );

  }

  catch (err) {

    console.error(
      "❌ Deployment failed:",
      err
    );

    /* -----------------------------
       SAVE FAILURE LOG
    ----------------------------- */

    await addLog(

      projectName,

      `Deployment failed: ${err.message}`,

      "error"

    );

    /* -----------------------------
       UPDATE FAILED SERVICE
    ----------------------------- */

    const existingService =
      await Service.findOne({

        name: projectName,

        user: userId

      });

    if (existingService) {

      existingService.status =
        "failed";

      existingService.error =
        err.message;

      await existingService.save();

    }

  }

}

/* -----------------------------
   GENERATE METRICS
----------------------------- */


// async function buildImage(projectPath, imageName) {
//   return new Promise((resolve, reject) => {
//     docker.buildImage(
//       {
//         context: projectPath,
//         src: ["."]
//       },
//       { t: imageName },
//       (err, stream) => {
//         if (err) return reject(err);

//         docker.modem.followProgress(stream, (err, res) => {
//           if (err) reject(err);
//           else resolve(res);
//         });
//       }
//     );
//   });
// }

async function buildImage(
  projectPath,
  imageName,
  projectName
) {
  return new Promise((resolve, reject) => {
    docker.buildImage(
      {
        context: projectPath,
        src: ["."]
      },
      { t: imageName },
      async (err, stream) => {
        if (err) {
          return reject(err);
        }
        stream.on(
          "data",
          async (chunk) => {
            const text =
              chunk.toString();
            try {
              const lines =
                text
                  .split("\n")
                  .filter(Boolean);
              for (const line of lines) {
                try {
                  const parsed =
                    JSON.parse(line);
                  if (parsed.stream) {
                    const log =
                      parsed.stream.trim();
                    console.log(log);
                    await addLog(
                      projectName,
                      log
                    );
                  }
                } catch {
                  console.log(line);
                  await addLog(
                    projectName,
                    line
                  );
                }
              }
            } catch (e) {
              console.log(e);
            }
          }
        );
        docker.modem.followProgress(
          stream,
          (err, res) => {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          }
        );
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

async function removeOldContainer(containerName) {

  try {

    const oldContainer =
      docker.getContainer(containerName);

    await oldContainer.inspect();

    console.log(
      `Removing old container: ${containerName}`
    );

    await oldContainer.remove({
      force: true
    });

  } catch (err) {

    // Container doesn't exist → ignore
    console.log(
      "No old container found"
    );

  }

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


async function getContainerStatus(containerId) {

  try {

    const container = docker.getContainer(containerId);

    const info = await container.inspect();

    return {
      running: info.State.Running,
      status: info.State.Status,
      startedAt: info.State.StartedAt
    };

  } catch (err) {

    return {
      running: false,
      status: "not_found"
    };

  }

}

async function getContainerMetrics(containerId) {

  try {

    const container = docker.getContainer(containerId);

    const stats = await container.stats({ stream: false });

    // CPU calculation
    const cpuDelta =
      stats.cpu_stats.cpu_usage.total_usage -
      stats.precpu_stats.cpu_usage.total_usage;

    const systemDelta =
      stats.cpu_stats.system_cpu_usage -
      stats.precpu_stats.system_cpu_usage;

    let cpuUsage = 0;

if (systemDelta > 0 && cpuDelta > 0) {
  cpuUsage =
    (cpuDelta / systemDelta) *
    stats.cpu_stats.online_cpus *
    100;
}
    // Memory calculation
    let memoryUsage = 0;

if (
  stats.memory_stats.limit > 0
) {
  memoryUsage =
    (stats.memory_stats.usage /
      stats.memory_stats.limit) *
    100;
}
    return {
      cpu: cpuUsage.toFixed(2),
      memory: memoryUsage.toFixed(2)
    };

  } catch (err) {

    return {
      cpu: 0,
      memory: 0
    };

  }

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

app.get('/intelligence/:serviceId', auth,async (req, res) => {

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

async function updateServiceStatus(
  serviceId,
  userId,
  status
) {

  return await Service.findOneAndUpdate(
    {
      serviceId,
      user: userId
    },
    { status },
    { new: true }
  );

}

/* -----------------------------
   APPLY SCALING
----------------------------- */

async function applyScaling(
  serviceId,
  action
) {

  const service =
    await Service.findOne({
      serviceId
    });

  if (!service) return;

  if (action === "scale_up") {
    service.replicas += 1;
  }

  if (
    action === "scale_down" &&
    service.replicas > 1
  ) {
    service.replicas -= 1;
  }

  await service.save();

}


/* -----------------------------
   START SERVER
----------------------------- */

const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CloudMind backend running on port ${PORT}`);
});