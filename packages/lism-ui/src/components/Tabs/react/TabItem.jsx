// Note: <Tabs>側でループして色々処理される。
// 引数でちゃんと処理したいpropを書いておかないとだめ。
export default function TabItem({ isTabItem = true, children }) {
	return <div>{children}</div>;
}
