pipeline {
    agent any

    environment {
        BACKEND_DIR = 'backend'
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
                    def nodeHome = tool name: "nodejs${NODE_VERSION}", type: 'NodeJS'
                    env.PATH = "${nodeHome}/bin:${env.PATH}"
                }
            }
        }

        stage('Install Artillery') {
            steps {
                dir("${BACKEND_DIR}") {
                    sh 'npm install --no-save artillery'
                }
            }
        }

        stage('Run Scalability Test') {
            steps {
                dir("${BACKEND_DIR}") {
                    sh 'npx artillery run load-test.yml --output artillery-report.json'
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: '**/artillery-report.json', allowEmptyArchive: true
        }
        success {
            echo 'Scalability tests completed successfully!'
        }
        failure {
            echo 'Scalability tests failed! Check the report for details.'
        }
    }
}
