import { NextRequest, NextResponse } from 'next/server'
import { oauth2Client } from '@/lib/oauth2-client'

export async function POST(request: NextRequest) {
  // 只在开发环境下允许访问
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: '仅在开发环境可用' }, { status: 403 })
  }

  try {
    console.log('开始测试文件上传...')
    
    // 获取表单数据
    const formData = await request.formData()
    const file = formData.get('file') as File
    const directory = formData.get('directory') as string || 'test'

    if (!file) {
      return NextResponse.json({
        success: false,
        error: '请选择要上传的文件'
      }, { status: 400 })
    }

    console.log('上传文件信息:', {
      name: file.name,
      size: file.size,
      type: file.type,
      directory: directory
    })

    // 测试OAuth2连接
    const connectionResult = await oauth2Client.testConnection()
    if (!connectionResult.success) {
      return NextResponse.json({
        success: false,
        error: 'OAuth2连接失败',
        details: connectionResult.error
      }, { status: 500 })
    }

    // 上传文件
    const startTime = Date.now()
    const fileUrl = await oauth2Client.uploadFile(file, directory)
    const endTime = Date.now()

    console.log('文件上传成功:', {
      fileUrl,
      uploadTime: `${endTime - startTime}ms`
    })

    return NextResponse.json({
      success: true,
      message: '文件上传成功',
      data: {
        fileUrl,
        originalName: file.name,
        size: file.size,
        type: file.type,
        directory: directory,
        uploadTime: `${endTime - startTime}ms`
      }
    })

  } catch (error) {
    console.error('文件上传测试失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '文件上传失败',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// 支持GET请求返回上传表单（用于测试）
export async function GET(request: NextRequest) {
  // 只在开发环境下允许访问
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: '仅在开发环境可用' }, { status: 403 })
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>文件上传测试</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0056b3; }
        .result { margin-top: 20px; padding: 15px; border-radius: 4px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
    </style>
</head>
<body>
    <h1>文件上传测试</h1>
    <form id="uploadForm" enctype="multipart/form-data">
        <div class="form-group">
            <label for="file">选择文件:</label>
            <input type="file" id="file" name="file" required>
        </div>
        <div class="form-group">
            <label for="directory">目录路径:</label>
            <input type="text" id="directory" name="directory" value="test" placeholder="例如: avatars, documents">
        </div>
        <button type="submit">上传文件</button>
    </form>
    
    <div id="result"></div>

    <script>
        document.getElementById('uploadForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData();
            const fileInput = document.getElementById('file');
            const directoryInput = document.getElementById('directory');
            
            if (!fileInput.files[0]) {
                showResult('请选择要上传的文件', 'error');
                return;
            }
            
            formData.append('file', fileInput.files[0]);
            formData.append('directory', directoryInput.value);
            
            showResult('正在上传文件...', 'info');
            
            try {
                const response = await fetch('/api/test/file-upload', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showResult(\`
                        <strong>上传成功!</strong><br>
                        文件URL: <a href="\${result.data.fileUrl}" target="_blank">\${result.data.fileUrl}</a><br>
                        原始文件名: \${result.data.originalName}<br>
                        文件大小: \${result.data.size} bytes<br>
                        文件类型: \${result.data.type}<br>
                        目录: \${result.data.directory}<br>
                        上传耗时: \${result.data.uploadTime}
                    \`, 'success');
                } else {
                    showResult(\`上传失败: \${result.error}<br>详情: \${result.details || ''}\`, 'error');
                }
            } catch (error) {
                showResult(\`上传失败: \${error.message}\`, 'error');
            }
        });
        
        function showResult(message, type) {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = message;
            resultDiv.className = 'result ' + type;
        }
    </script>
</body>
</html>
  `

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  })
}
