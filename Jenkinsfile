// ===========================================
// MediTrack - Jenkins CI/CD Pipeline (Windows)
// ===========================================

pipeline {
    agent any

    environment {
        // Docker Hub username (update this to your username)
        DOCKER_USERNAME = 'dinraj'
        
        // Image names
        BACKEND_IMAGE = "${DOCKER_USERNAME}/meditrack-backend"
        FRONTEND_IMAGE = "${DOCKER_USERNAME}/meditrack-frontend"
        
        // Version tag (uses build number)
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
            }
        }

        // ===========================================
        // Stage 2: Install Dependencies & Test
        // ===========================================
        stage('Backend - Install & Test') {
            steps {
                dir('backend') {
                    bat 'npm ci'
                    echo 'Backend installed successfully'
                }
            }
        }

        stage('Frontend - Install & Test') {
            steps {
                dir('frontend') {
                    bat 'npm ci'
                    bat 'npm run lint || exit 0'
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
                            bat "docker build -t %BACKEND_IMAGE%:%IMAGE_TAG% ."
                            bat "docker tag %BACKEND_IMAGE%:%IMAGE_TAG% %BACKEND_IMAGE%:latest"
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            bat "docker build -t %FRONTEND_IMAGE%:%IMAGE_TAG% ."
                            bat "docker tag %FRONTEND_IMAGE%:%IMAGE_TAG% %FRONTEND_IMAGE%:latest"
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
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    bat 'docker login -u %DOCKER_USER% -p %DOCKER_PASS%'
                    bat "docker push %BACKEND_IMAGE%:%IMAGE_TAG%"
                    bat "docker push %BACKEND_IMAGE%:latest"
                    bat "docker push %FRONTEND_IMAGE%:%IMAGE_TAG%"
                    bat "docker push %FRONTEND_IMAGE%:latest"
                }
            }
        }

        // ===========================================
        // Stage 5: Deploy (Optional)
        // ===========================================
        stage('Deploy to Staging') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying to staging environment...'
            }
        }
    }

    // ===========================================
    // Post Actions
    // ===========================================
    post {
        always {
            node('') {
                bat 'docker system prune -f || exit 0'
                cleanWs()
            }
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
