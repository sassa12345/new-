const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads'); // アップロードファイルを保存するディレクトリ

// アップロードディレクトリが存在しない場合は作成
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

// Multerの設定
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // ファイル名が重複しないようにユニークな名前を生成
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// 静的ファイルの提供 (HTML, CSS, JSなど)
app.use(express.static('public'));

// ファイルアップロードのエンドポイント
app.post('/upload', upload.single('myFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('ファイルが選択されていません。');
    }
    res.send(`ファイル ${req.file.originalname} がアップロードされました。`);
});

// アップロードされたファイルの一覧を表示するエンドポイント
app.get('/files', (req, res) => {
    fs.readdir(UPLOAD_DIR, (err, files) => {
        if (err) {
            console.error('ファイル一覧の取得中にエラーが発生しました:', err);
            return res.status(500).send('サーバーエラーが発生しました。');
        }
        res.json(files);
    });
});

// ファイルダウンロードのエンドポイント
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(UPLOAD_DIR, filename);

    // ファイルの存在を確認
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).send('ファイルが見つかりません。');
        }
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('ファイルダウンロード中にエラーが発生しました:', err);
                // エラーハンドリング (クライアントへの通知など)
            }
        });
    });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`サーバーがポート ${PORT} で起動しました。`);
    console.log(`アクセス: http://localhost:${PORT}`);
});
