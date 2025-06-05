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
			<Flex g={['20', '30', '40']} p={['20', '30', '40']} bd bdc='divider'>
				<Box lh='1' p='30' bd>
					1
				</Box>
				<Box lh='1' p='30' bd>
					2
				</Box>
				<Box lh='1' p='30' bd>
					3
				</Box>
				<Box lh='1' p='30' bd mis='auto'>
					4
				</Box>
			</Flex>
			<Columns cols='2' g='40'>
				<Box bgc='base' p='40' bdrs='2' bxsh='3'>
					Columns
				</Box>
				<Box bgc='base' p='40' bdrs='2' bxsh='3'>
					Columns
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
