rm -rf .git
git init
git add .
git commit -m "init"
git remote add origin "$1"
git branch -M main
git push -u origin main
npm install
