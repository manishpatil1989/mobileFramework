/** Pipeline Steps ****/

${AGENT} = Jenkin’s Agent
$CMD = gulp command
stage('QA Automation'){
steps{
catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
script {

                node("${AGENT}"){
                    dir(‘REPO’){
                    checkout([$class: 'GitSCM', branches: [[name: 'origin/${QA_Automation_Branch}']], doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'CleanBeforeCheckout'], [$class: 'WipeWorkspace']], submoduleCfg: [], userRemoteConfigs: [[credentialsId: ‘XYZ’, url: ‘Repo URL’]]])
                    sh 'mkdir -p ./TestX-Mobile-WDIO/apps/ios'
                    sh 'cp -r /var/tmp/Debug-iphonesimulator/FIPhoneASP.app <project>/apps/ios/TestApp.app'
                    dir('<project>'){
                    sh 'npm install'
                     sh 'eval $CMD’
                    sh 'exit 0'
                    }
                    }
                }
            }
          }
        }
    }
    stage('Publish Allure Report')
    {
        steps {
            node("${AGENT}"){
             dir('testautomation/TestX/test/mobile/reports') {
                script
                    {
                        sh 'cp $WORKSPACE/TestX-Mobile-WDIO/test/mobile/config/allure/allureConfig.json $WORKSPACE/testautomation/<project>/test/mobile/reports/allure-results-ios/categories.json'
                        allure([ includeProperties: false, jdk: '', properties: [], reportBuildPolicy: 'ALWAYS', results: [[path: 'allure-results-ios']] ])
                    }

             }
            }
        }
    }
