// ===========================================
// MediTrack - Jenkins CI/CD Pipeline
// ===========================================

pipeline {
    agent any

    environment {
        // Docker Hub credentials (configure in Jenkins credentials)
        DOCKER_HUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKER_USERNAME = 'dinraj'
        
        // Image names
        BACKEND_IMAGE = "${DOCKER_USERNAME}/meditrack-backend"
        FRONTEND_IMAGE = "${DOCKER_USERNAME}/meditrack-frontend"
        
        // Version tag (uses build number or git commit)
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        // ===========================================
        // Stage 1: Checkout Code
        // ===========================================
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                }
            }
        }

        // ===========================================
        // Stage 2: Install Dependencies & Test
        // ===========================================
        stage('Backend - Install & Test') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    // Uncomment when tests are added
                    // sh 'npm test'
                    sh 'npm run lint || true'
                }
            }
        }

        stage('Frontend - Install & Test') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    // Uncomment when tests are added
                    // sh 'npm test'
                    sh 'npm run lint || true'
                }
            }
        }

        // ===========================================
        // Stage 3: Build Docker Images
        // ===========================================
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            sh """
                                docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} .
                                docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest
                            """
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            sh """
                                docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} .
                                docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest
                            """
                        }
                    }
                }
            }
        }

        // ===========================================
        // Stage 4: Push to Docker Hub
        // ===========================================
        stage('Push to Docker Hub') {
            when {
                branch 'main'
            }
            steps {
                sh 'echo $DOCKER_HUB_CREDENTIALS_PSW | docker login -u $DOCKER_HUB_CREDENTIALS_USR --password-stdin'
                sh """
                    docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                    docker push ${BACKEND_IMAGE}:latest
                    docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                    docker push ${FRONTEND_IMAGE}:latest
                """
            }
        }

        // ===========================================
        // Stage 5: Deploy (Optional - for staging/prod)
        // ===========================================
        stage('Deploy to Staging') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying to staging environment...'
                // Uncomment and configure for your deployment
                // sh 'docker-compose -f docker-compose.staging.yml up -d'
                
                // Or deploy to a remote server via SSH
                // sshagent(['staging-server-ssh']) {
                //     sh '''
                //         ssh user@staging-server "
                //             cd /opt/meditrack &&
                //             docker-compose pull &&
                //             docker-compose up -d
                //         "
                //     '''
                // }
            }
        }
    }

    // ===========================================
    // Post Actions
    // ===========================================
    post {
        always {
            // Clean up Docker images to save space
            sh 'docker system prune -f || true'
            
            // Clean workspace
            cleanWs()
        }
        success {
            echo '✅ Pipeline completed successfully!'
            // Uncomment for Slack notification
            // slackSend(color: 'good', message: "Build #${BUILD_NUMBER} succeeded for MediTrack")
        }
        failure {
            echo '❌ Pipeline failed!'
            // Uncomment for Slack notification
            // slackSend(color: 'danger', message: "Build #${BUILD_NUMBER} failed for MediTrack")
        }
    }
}
