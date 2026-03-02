export default {
	extends: ['stylelint-config-recommended-scss', 'stylelint-prettier/recommended'],
	// 自動生成ファイルは stylelint の対象外
	ignoreFiles: ['**/_prop-config.scss'],
};
