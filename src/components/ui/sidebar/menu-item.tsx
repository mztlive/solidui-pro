import { useNavigate } from "@solidjs/router"
import { AiOutlineDown, AiOutlineRight } from "solid-icons/ai"
import { type Accessor, For, Show, createMemo } from "solid-js"
import { Dynamic } from "solid-js/web"
import { Motion } from "solid-motionone"
import I18nText from "~/components/framework/i18n-text"
import { type MenuItemType, useSidebarContext } from "./sidebar"
import SubmenuItem from "./submenu-item"

interface MenuItemProps {
	item: MenuItemType
	index: Accessor<number>
}

const Menu = (props: MenuItemProps) => {
	const { openItems, selectedItem, toggleItem, selectItem } =
		useSidebarContext()

	const navigate = useNavigate()

	const itemIndex = createMemo(() => props.index().toString())
	const hasChildren = createMemo(() => props.item.children?.length > 0)
	const isSelected = createMemo(() => selectedItem() === itemIndex())

	const itemBaseClass =
		"flex items-center p-2 mb-2 cursor-pointer gap-2 text-base rounded-md text-white user-select-none hover:bg-selected-background"

	return (
		<li>
			<div
				classList={{
					[itemBaseClass]: true,
					"bg-selected-background": isSelected() && !hasChildren(),
				}}
				onClick={() => {
					selectItem(itemIndex(), hasChildren())
					hasChildren()
						? toggleItem(itemIndex())
						: navigate(props.item.href || "/")
				}}
			>
				<Dynamic component={props.item.icon} />
				<Motion.span
					animate={{
						opacity: [0, 1],
						transition: {
							duration: 0.3,
							easing: "ease-in-out",
						},
					}}
				>
					<I18nText text={props.item.text} />
				</Motion.span>
				<Show when={hasChildren()}>
					<span class="ml-auto pr-4">
						<Dynamic
							component={
								openItems()[itemIndex()]
									? AiOutlineDown
									: AiOutlineRight
							}
							size={12}
						/>
					</span>
				</Show>
			</div>
			<Show when={hasChildren() && openItems()[itemIndex()]}>
				<Motion.ul
					animate={{
						opacity: [0, 1],
						x: [-20, 0],
					}}
					transition={{
						duration: 0.3,
						easing: "ease-in-out",
					}}
					class="pl-8 overflow-hidden"
				>
					<For each={props.item.children}>
						{(subItem, subIndex) => (
							<SubmenuItem
								subItem={subItem}
								subIndex={subIndex}
								parentIndex={itemIndex()}
							/>
						)}
					</For>
				</Motion.ul>
			</Show>
		</li>
	)
}

export default Menu
