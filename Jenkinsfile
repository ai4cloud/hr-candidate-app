pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'  // 使用 Jenkins 中配置的 NodeJS 20 LTS
    }

    parameters {
        choice(
            name: 'DEPLOY_ENV',
            choices: ['development', 'test', 'stage', 'production'],
            description: '选择部署环境'
        )
        booleanParam(
            name: 'SKIP_TESTS',
            defaultValue: false,
            description: '是否跳过测试'
        )
    }

    environment {
        // Node 版本
        NODE_VERSION = '20'
        // 项目名称
        APP_NAME = 'hr-candidate-app'
        // 构建目录
        BUILD_DIR = "${WORKSPACE}"
        // PM2 应用名称
        PM2_APP_NAME = "${APP_NAME}-${params.DEPLOY_ENV}"
    }

    stages {
        stage('环境信息') {
            steps {
                script {
                    echo "======================================"
                    echo "部署环境: ${params.DEPLOY_ENV}"
                    echo "分支: ${env.GIT_BRANCH}"
                    echo "构建号: ${env.BUILD_NUMBER}"
                    echo "======================================"
                }
            }
        }

        stage('清理工作空间') {
            steps {
                echo '清理旧的构建文件...'
                sh '''
                    rm -rf .next
                    rm -rf node_modules/.cache
                '''
            }
        }

        stage('安装依赖') {
            steps {
                echo '安装 npm 依赖...'
                sh '''
                    npm ci --legacy-peer-deps
                '''
            }
        }

        stage('配置环境变量') {
            steps {
                script {
                    echo "配置 ${params.DEPLOY_ENV} 环境变量..."

                    // 方案1: 从 Jenkins Credentials 读取环境变量
                    withCredentials([
                        string(credentialsId: "db-url-${params.DEPLOY_ENV}", variable: 'DATABASE_URL'),
                        string(credentialsId: "aes-key-${params.DEPLOY_ENV}", variable: 'ACCESS_TOKEN_AES_KEY'),
                        string(credentialsId: "oauth2-client-id-${params.DEPLOY_ENV}", variable: 'OAUTH2_CLIENT_ID'),
                        string(credentialsId: "oauth2-client-secret-${params.DEPLOY_ENV}", variable: 'OAUTH2_CLIENT_SECRET'),
                        string(credentialsId: "oauth2-username-${params.DEPLOY_ENV}", variable: 'OAUTH2_USERNAME'),
                        string(credentialsId: "oauth2-password-${params.DEPLOY_ENV}", variable: 'OAUTH2_PASSWORD'),
                        string(credentialsId: "admin-service-base-url-${params.DEPLOY_ENV}", variable: 'ADMIN_SERVICE_BASE_URL'),
                        string(credentialsId: "tenant-id-${params.DEPLOY_ENV}", variable: 'TENANT_ID')
                    ]) {
                        // 生成 .env 文件
                        sh """
                            cat > .env << EOF
# 数据库配置
DATABASE_URL="${DATABASE_URL}"

# Token解密密钥
ACCESS_TOKEN_AES_KEY="${ACCESS_TOKEN_AES_KEY}"

# OAuth2配置
OAUTH2_CLIENT_ID="${OAUTH2_CLIENT_ID}"
OAUTH2_CLIENT_SECRET="${OAUTH2_CLIENT_SECRET}"
OAUTH2_USERNAME="${OAUTH2_USERNAME}"
OAUTH2_PASSWORD="${OAUTH2_PASSWORD}"

# 管理端服务地址（Token URL 和文件上传 URL 会自动基于此地址生成）
ADMIN_SERVICE_BASE_URL="${ADMIN_SERVICE_BASE_URL}"

# 多租户配置
TENANT_ID="${TENANT_ID}"

# 应用配置
NEXT_PUBLIC_APP_NAME="候选人简历填写系统"
NEXT_PUBLIC_APP_VERSION="1.0.0"
EOF
                        """
                    }

                    // 方案2: 直接复制预设的 .env 文件
                    // sh "cp .env.${params.DEPLOY_ENV} .env"
                }
            }
        }

        stage('生成 Prisma 客户端') {
            steps {
                echo '生成 Prisma 客户端...'
                sh 'npm run prisma:generate'
            }
        }

        stage('数据库迁移') {
            when {
                expression { false }  // 禁用数据库迁移：数据库由管理端统一管理，候选人应用不负责 schema 更新
            }
            steps {
                echo '执行数据库迁移...'
                sh 'npm run prisma:migrate'
            }
        }

        stage('运行测试') {
            when {
                expression { !params.SKIP_TESTS }
            }
            steps {
                echo '运行测试...'
                sh '''
                    # npm run test
                    echo "测试步骤跳过（项目中未配置测试）"
                '''
            }
        }

        stage('构建项目') {
            steps {
                script {
                    echo "构建 ${params.DEPLOY_ENV} 环境..."
                    sh """
                        NODE_ENV=${params.DEPLOY_ENV} npm run build
                    """
                }
            }
        }

        stage('部署') {
            steps {
                script {
                    echo "部署到 ${params.DEPLOY_ENV} 环境..."

                    // 使用 PM2 部署
                    sh """
                        # 检查 PM2 进程是否存在
                        if pm2 describe ${PM2_APP_NAME} > /dev/null 2>&1; then
                            echo "重启现有应用..."
                            NODE_ENV=${params.DEPLOY_ENV} pm2 restart ${PM2_APP_NAME} --update-env
                        else
                            echo "启动新应用..."
                            NODE_ENV=${params.DEPLOY_ENV} pm2 start npm --name ${PM2_APP_NAME} -- run start:${params.DEPLOY_ENV}
                        fi

                        # 保存 PM2 配置
                        pm2 save

                        # 查看应用状态
                        pm2 info ${PM2_APP_NAME}
                    """
                }
            }
        }

        stage('健康检查') {
            steps {
                script {
                    echo '检查应用健康状态...'
                    sh '''
                        sleep 5
                        # 这里添加健康检查逻辑
                        # curl -f http://localhost:3000/api/health || exit 1
                        echo "健康检查通过"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "======================================"
            echo "✅ 构建成功！"
            echo "环境: ${params.DEPLOY_ENV}"
            echo "======================================"
            // 可以添加通知逻辑（邮件、企业微信、钉钉等）
        }
        failure {
            echo "======================================"
            echo "❌ 构建失败！"
            echo "======================================"
            // 可以添加通知逻辑
        }
        always {
            // 清理敏感文件
            sh '''
                if [ -f .env ]; then
                    echo "清理 .env 文件..."
                    rm -f .env
                fi
            '''
        }
    }
}
