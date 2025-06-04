import { Box, Flex, Container, Link, Dummy, Divider, Columns } from 'lism-css/react';

function App() {
	return (
		<Container size='m' hasGutter isFlow>
			<Flex g='20' py='20'>
				<img src='vite.svg' />
				<h1>Vite + Lism UI</h1>
			</Flex>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repellat itaque et voluptatum, ducimus temporibus accusamus exercitationem
				dolores id impedit corporis asperiores debitis soluta, nemo iusto optio quae. Ducimus, aperiam tempora!
			</p>
			<Columns cols='2' g='40'>
				<Box bgc='base' p='40' bdrs='2' bxsh='3'>
					Columns &gt; Box
				</Box>
				<Box bgc='base' p='40' bdrs='2' bxsh='3'>
					Columns &gt; Box
				</Box>
			</Columns>

			<Dummy length='s' />
			<Dummy length='l' />

			<Flex jc='c'>
				<Link href='###' hov='fade' bgc='text' lh='xs' c='base' px='30' py='20' td='n' bdrs='5'>
					Link Button
				</Link>
			</Flex>
			<Divider />
		</Container>
	);
}

export default App;
