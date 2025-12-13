import { Box, Flex, Container, HTML, Dummy, Divider, Columns } from 'lism-css/react';

function App() {
	return (
		<Container size='m' hasGutter layout='flow'>
			<Flex g='15' py='15'>
				<img src='vite.svg' />
				<h1>Vite + Lism UI</h1>
			</Flex>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repellat itaque et voluptatum, ducimus temporibus accusamus exercitationem
				dolores id impedit corporis asperiores debitis soluta, nemo iusto optio quae. Ducimus, aperiam tempora!
			</p>
			<Flex g={['10', '15', '20']} p={['10', '15', '20']} bd bdc='line'>
				<Box lh='1' p='20' bd>
					1
				</Box>
				<Box lh='1' p='20' bd>
					2
				</Box>
				<Box lh='1' p='20' bd>
					3
				</Box>
				<Box lh='1' p='20' bd mx-s='auto'>
					4
				</Box>
			</Flex>
			<Columns cols='2' g='30'>
				<Box bgc='base' p='30' bdrs='10' bxsh='30'>
					Columns
				</Box>
				<Box bgc='base' p='30' bdrs='10' bxsh='30'>
					Columns
				</Box>
			</Columns>

			<Dummy length='s' />
			<Dummy length='l' />

			<Flex jc='center'>
				<HTML.a href='###' hov='o' bgc='text' lh='xs' c='base' px='20' py='15' td='none' bdrs='50'>
					Link Button
				</HTML.a>
			</Flex>
			<Divider />
		</Container>
	);
}

export default App;
