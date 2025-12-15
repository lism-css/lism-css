const LOREM_IPSUM = {
	ja: [
		`ロレム・イプサムの座り雨。`,
		`目まぐるしい文章の流れの中で、それは静かに歩く仮の言葉です。`,
		`Elitも穏やかに続いていきますが、積み重ねられてきた「LiberroyとFoogの取り組み」は、余白のようなものです。`,
		`作業が進むにつれて、工夫や考えとともに関心が折り重なりながらも、必要以上に主張せず彼らの作品は私たちに一定の示唆を与えてくれます。`,
		`内容の違いを比べるためのドラーとして、静かにそこにあります。選ばれた事実や、意味を限定しない言葉の並びは、全体の雰囲気を整える役割を果たします。時間の流れの中で、そうした文章は自然に形を変え、使う人の意図に委ねられていきます。`,
	],
	en: [
		'Lorem ipsum dolor sit amet.',
		'Consectetur adipiscing elit, sed do eiusmod tempor Incididunt ut.',
		'Labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut.',
		'Aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint.',
		'Occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis undeomnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.',
	],
};

export default {
	ja: {
		xs: LOREM_IPSUM.ja[0],
		s: LOREM_IPSUM.ja[0] + LOREM_IPSUM.ja[1],
		m: LOREM_IPSUM.ja[0] + LOREM_IPSUM.ja[1] + LOREM_IPSUM.ja[2],
		l: LOREM_IPSUM.ja[0] + LOREM_IPSUM.ja[1] + LOREM_IPSUM.ja[2] + LOREM_IPSUM.ja[3],
		xl: LOREM_IPSUM.ja[0] + LOREM_IPSUM.ja[1] + LOREM_IPSUM.ja[2] + LOREM_IPSUM.ja[3] + LOREM_IPSUM.ja[4],
		codes: `ロレム・イプサムの<i>座り雨</i>、それは<a href='###'>静かに歩く仮の言葉</a>です。長いあいだ積み重ねられてきた<code>Liberroy</code>と<code>Foog</code>の取り組み」は、私たちに<b>一定の示唆</b>を与えてくれます。`,
	},

	en: {
		xs: LOREM_IPSUM.en[0],
		s: LOREM_IPSUM.en[0] + LOREM_IPSUM.en[1],
		m: LOREM_IPSUM.en[0] + LOREM_IPSUM.en[1] + LOREM_IPSUM.en[2],
		l: LOREM_IPSUM.en[0] + LOREM_IPSUM.en[1] + LOREM_IPSUM.en[2] + LOREM_IPSUM.en[3],
		xl: LOREM_IPSUM.en[0] + LOREM_IPSUM.en[1] + LOREM_IPSUM.en[2] + LOREM_IPSUM.en[3] + LOREM_IPSUM.en[4],
		codes: `Lorem ipsum dolor <i>sit amet</i>. consectetur <a href='###'>adipisicing elit</a>, sed do eiusmod tempor. Non facere <code>Laudantium</code> ex eos <b>doloribus aut dolore</b> nisi provident.`,
	},
	ar: {
		s: 'هذا نص وهمي أنا أكتب جمل ليس لها معنى معين.هذا نص وهمي أنا أكتب جمل ليس لها معنى معين.هذا نص وهمي أنا أكتب جمل ليس لها معنى معين.',
	},
};
