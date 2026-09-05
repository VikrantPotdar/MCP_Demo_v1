pipeline {
  agent any

  options {
    timestamps()
  }

  environment {
    NODE_ENV = 'test'
    CI = '1'
    BROWSER = 'chromium'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install dependencies') {
      steps {
        powershell 'npm ci'
      }
    }

    stage('Install Playwright browsers') {
      steps {
        powershell 'npx playwright install --with-deps'
      }
    }

    stage('Run Playwright tests') {
      steps {
        powershell "npx playwright test --project=${env.BROWSER}"
      }
    }

    stage('Generate Allure report') {
      steps {
        powershell 'npx allure generate allure-results --clean -o allure-report'
        allure([
          includeProperties: false,
          jdk: '',
          commandline: 'allure',
          results: [[path: 'allure-results']]
        ])
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'allure-results/**, allure-report/**, test-results/**', allowEmptyArchive: true
      emailext(
        subject: "Jenkins Build: ${env.JOB_NAME} #${env.BUILD_NUMBER} - ${currentBuild.currentResult}",
        body: """
            <h2>Playwright Test Execution Report</h2>
            <p><b>Job:</b> ${env.JOB_NAME}</p>
            <p><b>Build Number:</b> ${env.BUILD_NUMBER}</p>
            <p><b>Status:</b> ${currentBuild.currentResult}</p>
            <p><b>Browser:</b> ${env.BROWSER}</p>
            <p><a href="${env.BUILD_URL}allure/">View Allure Report</a></p>
            <p><a href="${env.BUILD_URL}console">View Console Log</a></p>
        """,
        to: "vikrantpotdar69@gmail.com",
        mimeType: "text/html"
      )
    }
    failure {
      echo 'Playwright tests failed. Check the generated artifacts for details.'
    }
    success {
      script {
        powershell 'Remove-Item -Recurse -Force allure-results'
      }
    }
  }
}