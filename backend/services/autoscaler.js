const Service =
  require("../models/Service");

const Metric =
  require("../models/Metric");



module.exports = (
  runContainer,
  docker
) => {

  async function scaleUp(service) {

    try {

      console.log(
        `Scaling UP ${service.name}`
      );

      const getPort =
  (
    await import("get-port")
  ).default;

const port =
  await getPort();

      const containerName =
        `${service.name}-${Date.now()}`;

      const containerId =
        await runContainer(

          service.name,

          containerName,

          port,

          service.type

        );

      service.containers.push({

        containerId,

        port,

        status: "running"

      });

      service.replicas += 1;

      await service.save();

    }

    catch (err) {

      console.log(
        "Scale Up Error:",
        err
      );

    }

  }

//   async function scaleDown(service) {

//     try {

//       if (
//         service.replicas <= 1
//       ) {
//         return;
//       }

//       const removedContainer =
//         service.containers.pop();

//       const container =
//         docker.getContainer(
//           removedContainer.containerId
//         );

//       await container.stop();

//       await container.remove();

//       service.replicas -= 1;

//       await service.save();

//     }

//     catch (err) {

//       console.log(
//         "Scale Down Error:",
//         err
//       );

//     }

//   }

async function scaleDown(service) {

  try {

    /* -----------------------------
       MINIMUM 1 REPLICA
    ----------------------------- */

    if (
      !service.containers ||
      service.containers.length <= 1
    ) {

      console.log(
        `${service.name} already at minimum replicas`
      );

      return;

    }

    /* -----------------------------
       GET LAST CONTAINER
    ----------------------------- */

    const lastContainer =
      service.containers[
        service.containers.length - 1
      ];

    if (!lastContainer) {

      return;

    }

    /* -----------------------------
       REMOVE CONTAINER
    ----------------------------- */

    const container =
      docker.getContainer(
        lastContainer.containerId
      );

    await container.remove({

      force: true

    });

    /* -----------------------------
       REMOVE FROM DATABASE
    ----------------------------- */

    service.containers.pop();

    service.replicas =
      service.containers.length;

    await service.save();

    console.log(
      `Scaled down ${service.name}`
    );

  }

  catch (err) {

    console.log(
      "Scale Down Error:",
      err
    );

  }

}

  async function startAutoScaler() {

    setInterval(async () => {

      try {

        console.log(
          "Running autoscaler..."
        );

        const services =
          await Service.find({

            status: "running"

          });

        for (const service of services) {

          const latestMetric =
            await Metric.findOne({

              serviceId:
                service.serviceId

            }).sort({

              timestamp: -1

            });

          if (!latestMetric) {
            continue;
          }

          const cpu =
            Number(
              latestMetric.cpu
            );

          console.log(
            `${service.name} CPU: ${cpu}`
          );

          if (
            cpu > 70 &&
            service.replicas < 5
          ) {

            await scaleUp(
              service
            );

          }

          else if (
            cpu < 20 &&
            service.replicas > 1
          ) {

            await scaleDown(
              service
            );

          }

        }

      }

      catch (err) {

        console.log(
          "Autoscaler Error:",
          err
        );

      }

    }, 2000);

  }

  return {
    startAutoScaler
  };

};