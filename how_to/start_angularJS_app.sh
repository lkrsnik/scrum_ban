# get angular seed from git
git clone --depth=1 https://github.com/angular/angular-seed.git temp

# move files out of temp folder and delete useless files and directories
mv temp/* ./
rm karma.conf.js LICENSE README.md 
rm -rf temp e2e-tests

# creates directories for bower
mkdir public
mkdir public/libs

# creates .bowerrc so that bower installs its components there
printf "{\n    \"directory\": \"public/libs\"\n}" > .bowerrc

# installs required packages
npm install

# renames app to public, creates folders libs and copy the bower data there
# also creates .bowerrc to allways copy files there
mv app/* public/
rm -rf app

# changes index.html so that it finds all the required files (like angular.js etc)
sed -i -e "s/bower_components/libs/g" public/index.html

npm install gulp bower gulp-clean gulp-jslint gulp-uglify gulp-minify-css gulp-connect gulp-concat gulp-watch --save

mkdir public/src
mv public/app* public/src
mv public/view* public/src