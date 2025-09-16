pipeline {
    agent any

    environment {
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend'
        NODE_VERSION = '20'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Node') {
            steps {
                script {
                    // Use Node.js 20 for both frontend and backend
                    def nodeHome = tool name: "nodejs${NODE_VERSION}", type: 'NodeJS'
                    env.PATH = "${nodeHome}/bin:${env.PATH}"
                }
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend') {
                    steps {
                        dir("${BACKEND_DIR}") {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        stage('Lint') {
            parallel {
                stage('Backend') {
                    steps {
                        dir("${BACKEND_DIR}") {
                            sh 'npm run lint'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            sh 'npm run lint'
                        }
                    }
                }
            }
        }

        stage('Test') {
            parallel {
                stage('Backend') {
                    steps {
                        dir("${BACKEND_DIR}") {
                            sh 'npm test'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            sh 'npm run test:all || npm test'
                        }
                    }
                }
            }
            post {
                always {
                    junit '**/backend/coverage/*.xml'
                    junit '**/frontend/coverage/*.xml'
                }
            }
        }

        stage('Build') {
            parallel {
                stage('Backend') {
                    steps {
                        dir("${BACKEND_DIR}") {
                            sh 'npm run build || echo "No build script for backend"'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        // Add deploy stages here if needed
    }

    post {
        always {
            archiveArtifacts artifacts: '**/coverage/**', allowEmptyArchive: true
        }
        success {
            echo 'Build, test, and lint completed successfully!'
        }
        failure {
            echo 'Build failed. Check logs for details.'
        }
    }
}
