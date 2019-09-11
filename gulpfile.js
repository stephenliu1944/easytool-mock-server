'use strict';
var gulp = require('gulp');
var bump = require('gulp-bump');
var zip = require('gulp-zip');
var sftp = require('gulp-sftp-up4');
var { execSync } = require('child_process');
var { libraryName, deploy } = require('./package.json');

const { dev, test } = deploy;
const DIST_PATH = 'dist';                      // 目的地文件

// 更新预发布版本号, 开发中版本, 可能会有较大改动.
gulp.task('version-prerelease', () => {
    return gulp.src('./package.json')
        .pipe(bump({
            type: 'prerelease'
        }))
        .pipe(gulp.dest('./'));
});
// 更新 Z 版本号, 修复bug, 兼容老版本
gulp.task('version-patch', () => {
    return gulp.src('./package.json')
        .pipe(bump({
            type: 'patch'
        }))
        .pipe(gulp.dest('./'));
});
// 更新 Y 版本号, 兼容老版本
gulp.task('version-minor', () => {
    return gulp.src('./package.json')
        .pipe(bump({
            type: 'minor'
        }))
        .pipe(gulp.dest('./'));
});
// 更新 X 版本号, 不兼容老版本
gulp.task('version-major', () => {
    return gulp.src('./package.json')
        .pipe(bump({
            type: 'major'
        }))
        .pipe(gulp.dest('./'));
});
// 更新版本号
gulp.task('git-push', (done) => {
    execSync('git add -A :/');
    execSync('git commit -m "update version"');
    execSync('git push');
    done();
});
// 将静态资源压缩为zip格式
gulp.task('zip', () => {
    return gulp.src([`${DIST_PATH}/**`, `!${DIST_PATH}/*.zip`], { base: `${DIST_PATH}/` })
        .pipe(zip(`${libraryName}.zip`))
        .pipe(gulp.dest(DIST_PATH));
});
// 将静态资源发布到 dev 服务器
gulp.task('deploy-dev', () => {
    return gulp.src(dev.zip ? [`${DIST_PATH}/*.zip`] : [`${DIST_PATH}/**`, `!${DIST_PATH}/*.zip`])
        .pipe(sftp(dev));
});
// 将静态资源发布到 test 服务器
gulp.task('deploy-test', () => {
    return gulp.src(test.zip ? [`${DIST_PATH}/*.zip`] : [`${DIST_PATH}/**`, `!${DIST_PATH}/*.zip`])
        .pipe(sftp(test));
});
// 同时部署到开发和测试服务器
gulp.task('deploy-all', gulp.parallel('deploy-dev', 'deploy-test'));