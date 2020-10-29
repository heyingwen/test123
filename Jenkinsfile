def label = "slave-${UUID.randomUUID().toString()}"

def helmLint(String chartDir) {
  println "校验 chart 模板"
  sh "helm lint ${chartDir}"
}

def helmDeploy(Map args) {
  println "部署应用"
  sh "helm upgrade --install ${args.name} ${args.chartDir} -f ${args.valuePath} --set image.tag=${args.imageTag} --namespace ${args.namespace}"
  echo "应用 ${args.name} 部署成功，可以使用 helm status ${args.name} --namespace ${args.namespace} 查看应用状态"
}


podTemplate(label: label, containers: [
  containerTemplate(name: 'golang', image: 'golang:1.14.2-alpine3.11', command: 'cat', ttyEnabled: true),
  containerTemplate(name: 'docker', image: 'docker:latest', command: 'cat', ttyEnabled: true),
  containerTemplate(name: 'helm', image: 'cnych/helm', command: 'cat', ttyEnabled: true),
  containerTemplate(name: 'kubectl', image: 'cnych/kubectl', command: 'cat', ttyEnabled: true),
  containerTemplate(name: 'maven', image: 'maven:3.3.9-jdk-8-alpine', ttyEnabled: true, command: 'cat'),
  containerTemplate(name: 'nodejs', image: 'node', ttyEnabled: true, command: 'cat')
], serviceAccount: 'jenkins', volumes: [
  //hostPathVolume(mountPath: '/home/jenkins/.kube', hostPath: '/root/.kube'),
  hostPathVolume(mountPath: '/var/run/docker.sock', hostPath: '/var/run/docker.sock')
]) {
  node(label) {
    def myRepo = checkout scm
    //def gitCommit = myRepo.GIT_COMMIT
    //def gitBranch = myRepo.GIT_BRANCH
    def imageTag = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
    // 仓库地址
    def registryUrl = "192.168.100.46:1179"
    def appName = "devops-demo"
    def imageEndpoint = "course/${appName}"
    // 镜像地址：192.168.100.46:1179/course/devops-demo:7844e2b
    def image = "${registryUrl}/${imageEndpoint}:${imageTag}"

    stage('单元测试') {
      echo "测试阶段"
    }
    stage('代码编译打包') {
      try {
        container('nodejs') {

          echo "2.代码编译打包阶段"
          sh """
            node --version && npm --version && yarn -version && npm install && npm run build:test
            """
           
        }
      } catch (exc) {
        println "构建失败 - ${currentBuild.fullDisplayName}"
        throw(exc)
      }
    }
    stage('构建 Docker 镜像') {
        withCredentials([[$class: 'UsernamePasswordMultiBinding',
        credentialsId: 'docker-auth',
        usernameVariable: 'DOCKER_USER',
        passwordVariable: 'DOCKER_PASSWORD']]) {
          container('docker') {
            echo "3. 构建 Docker 镜像阶段"
            sh """
              docker login ${registryUrl} -u ${DOCKER_USER} -p ${DOCKER_PASSWORD}
              docker build -t ${image} .
              docker push ${image}
              """
          }
      }
    }
    stage('运行 Helm') {
      container('helm') {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
          echo "4. 开始 Helm 部署"
          sh "mkdir -p ~/.kube && cp ${KUBECONFIG} ~/.kube/config"
          def userInput = input(
            id: "userInput",
            message: "选择一个部署的环境",
            parameters: [
              [
                $class: "ChoiceParameterDefinition",
                choices: "Dev\nQA\nProduct",
                name: "部署环境"
              ]
            ]
          )
          echo "部署应用到 ${userInput} 环境"
          if (userInput == "Dev") {
            // 选择一个 dev 环境的 values 文件
          } else if (userInput == "QA") {
            // 选择一个 QA 环境的 values 文件
          } else {
            // 部署到 prod 环境
          }
          helmDeploy(
            name      : "${appName}",
            chartDir  : "./helm",
            valuePath : "./helm/my-values.yaml",
            imageTag  : "${imageTag}",
            namespace : "kube-ops"
          )
        }
      }
    }

    stage('运行 Kubectl') {
      container('kubectl') {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
          echo "5. 查看应用资源列表"
          sh "mkdir -p ~/.kube && cp ${KUBECONFIG} ~/.kube/config"
          sh "kubectl get all -n kube-ops -l app=devops-demo"
         }
       }
     }
   stage('快速回滚?') {
      container('helm') {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
          echo "6. 执行回滚操作"
          sh "mkdir -p ~/.kube && cp ${KUBECONFIG} ~/.kube/config"
          def userInput = input(
            id: "userInput",
            message: "是否需要进行回滚操作？",
            parameters: [
              [
                $class: "ChoiceParameterDefinition",
                choices: "Yes\nNo",
                name: "回滚?"
              ]
            ]
          )
          if (userInput == "Yes") {
            echo "执行回滚操作"
            sh "helm rollback ${appName} --namespace kube-ops"
          } else {
            echo "不需要回滚"
          }

        }
      }
    }
   
  }
}
