pipeline {
    agent any

    triggers {
        githubPush()
    }

    stages {
        stage('Build') {
            steps {
                echo 'Building project...'
                // Example: npm install or mvn clean install
                // sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                // Example: npm test or mvn test
                // sh 'npm test'
            }
        }

        stage('Scalability Test') {
            steps {
                echo 'Running scalability tests...'
                // Example: run k6 or JMeter
                // sh 'k6 run load-test.js'
            }
        }
    }
}
