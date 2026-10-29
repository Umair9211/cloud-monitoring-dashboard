# Cloud Monitoring Dashboard

A cloud-based monitoring application designed to track AWS infrastructure performance and application health. Built using FastAPI, React, and Docker, the project integrates AWS CloudWatch metrics with a containerized application and an automated CI/CD pipeline for deployment to Amazon EC2.

The project demonstrates practical cloud engineering and DevOps workflows, including infrastructure monitoring, REST API development, container management, and automated application deployment.

**Repository:** [cloud-monitoring-dashboard](https://github.com/Umair9211/cloud-monitoring-dashboard)

## Architecture
<img width="1376" height="768" alt="aws-cloud-monitoring" src="https://github.com/user-attachments/assets/1d51b66b-1bb2-4d10-842a-803abda57c7a" />

The application follows a frontend–backend architecture deployed on Amazon EC2. Nginx acts as the reverse proxy, routing incoming requests to the appropriate service. The FastAPI backend retrieves infrastructure metrics from AWS CloudWatch and collects application-level performance statistics, which are displayed through the React dashboard.

```text
                       User
                        |
                        v
               Nginx Reverse Proxy
                    Port 80
                        |
                +-------+-------+
                |               |
                v               v
          React Frontend   FastAPI Backend
                                  |
                         +--------+--------+
                         |                 |
                         v                 v
                  AWS CloudWatch    Request Metrics
                  CPU / Memory      Rate / Errors /
                                    Response Time
```

### AWS Architecture Diagram

<!-- Add the AWS architecture diagram here -->

<!-- ![AWS Architecture](docs/images/aws-architecture.png) -->

*The diagram will illustrate the AWS deployment environment, EC2 instance, IAM role, CloudWatch integration, and flow of monitoring data.*

## CI/CD Pipeline

GitHub Actions automates the application build and deployment process. Following the configured CI checks, Docker images are built and published to Docker Hub. The deployment workflow then connects to Amazon EC2, updates the running containers using Docker Compose, and verifies application health.

```text
GitHub Repository
        |
        v
GitHub Actions
        |
        v
Run CI Checks
        |
        v
Build Docker Images
        |
        v
Push Images to Docker Hub
        |
        v
Deploy to Amazon EC2
        |
        v
Docker Compose Update
        |
        v
Application Health Check
```

This workflow provides a repeatable deployment process and reduces the need for manual container builds and application updates.

## Technology Stack

| Category | Technologies |
|---|---|
| Cloud Platform | AWS |
| Compute | Amazon EC2 |
| Monitoring | Amazon CloudWatch, CloudWatch Agent |
| Backend | Python, FastAPI |
| Frontend | React, JavaScript |
| Containerization | Docker, Docker Compose |
| Reverse Proxy | Nginx |
| CI/CD | GitHub Actions |
| Container Registry | Docker Hub |
| Version Control | Git, GitHub |

## Key Features

- **Infrastructure Monitoring:** Retrieves EC2 CPU utilization from CloudWatch and memory utilization published by the CloudWatch Agent.
- **Application Metrics:** Tracks request rate, average response time, and HTTP error rate.
- **REST API:** Exposes endpoints for application health checks and monitoring data.
- **Containerized Services:** Runs the frontend and backend as separate Docker containers managed through Docker Compose.
- **Reverse Proxy:** Uses Nginx to serve the frontend and route API requests to the backend.
- **Automated CI/CD:** Builds and publishes Docker images and deploys application updates to EC2 through GitHub Actions.
- **Deployment Verification:** Checks application health after deployment to help identify unsuccessful updates.

## Screenshots
#Cloud Monitoring Dashboard
<img width="1274" height="719" alt="Screenshot from 2026-10-29 08-53-39" src="https://github.com/user-attachments/assets/06effecc-e289-4e8d-b437-0f9754b47c4f" />
#AWS setup Screens:
<img width="1274" height="722" alt="Screenshot from 2026-10-29 08-50-58" src="https://github.com/user-attachments/assets/97129122-d9ee-4b81-b74d-bbcd13a2f647" />

<img width="1274" height="722" alt="Screenshot from 2026-10-29 08-51-32" src="https://github.com/user-attachments/assets/18361283-6e97-4b2e-acee-9de6ca5884ed" />

<img width="1274" height="722" alt="Screenshot from 2026-10-29 08-52-08" src="https://github.com/user-attachments/assets/eeb56ac9-3e75-4e84-b62e-67c27dd52475" />

## Getting Started

### Prerequisites

- Git
- Docker and Docker Compose
- An AWS account with the appropriate CloudWatch permissions for monitoring

### Clone the Repository

```bash
git clone https://github.com/Umair9211/cloud-monitoring-dashboard.git
cd cloud-monitoring-dashboard
```

### Configure AWS Access

Configure an AWS profile for local development and set the required environment variables according to your configuration.

```bash
export AWS_PROFILE=cloud-monitoring
export AWS_REGION=ap-southeast-2
export EC2_INSTANCE_ID=YOUR_EC2_INSTANCE_ID
```

Replace `YOUR_EC2_INSTANCE_ID` with the EC2 instance you want to monitor. Do not commit AWS credentials or other secrets to the repository.

### Start the Application

```bash
docker compose up -d
```

Check the running services:

```bash
docker compose ps
```

Open the dashboard in your browser:

```text
http://localhost
```

The application must have the required AWS configuration to retrieve live infrastructure metrics.

## Author

**Umair Farooq**

GitHub: [Umair9211](https://github.com/Umair9211)
