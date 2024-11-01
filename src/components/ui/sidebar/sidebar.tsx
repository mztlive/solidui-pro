import {
	type Accessor,
	type Component,
	For,
	type ParentProps,
	Show,
	createContext,
	createEffect,
	createMemo,
	createSignal,
	useContext,
} from "solid-js"

import { AiOutlineAlignLeft, AiOutlineAlignRight } from "solid-icons/ai"

import type { Resolver } from "@solid-primitives/i18n"
import { useLocation } from "@solidjs/router"
import { SiBoxysvg } from "solid-icons/si"
import { Dynamic } from "solid-js/web"
import MenuItem from "./menu-item"

export type MenuItemType = {
	icon?: Component
	text: string | Resolver<string, string>
	children?: MenuItemType[]
	description?: string | Resolver<string, string>
	href?: string
}

interface SidebarContextProps {
	openItems: Accessor<Record<string, boolean>>
	selectedItem: Accessor<string | null>
	toggleItem: (index: string) => void
	selectItem: (index: string, hasChildren: boolean) => void
}

interface SidebarProps extends ParentProps {
	menuItems: MenuItemType[]
}

const SidebarContext = createContext<SidebarContextProps>()

const SidebarProvider = (props: SidebarProps) => {
	const location = useLocation()

	const [openItems, setOpenItems] = createSignal<Record<string, boolean>>({})
	const [selectedItem, setSelectedItem] = createSignal<string | null>(null)

	// 切换菜单项折叠状态
	const toggleItem = (index: string) => {
		setOpenItems({ ...openItems(), [index]: !openItems()[index] })
	}

	// 选中菜单项
	const selectItem = (index: string, hasChildren: boolean) => {
		if (!hasChildren) setSelectedItem(index)
	}

	// 使用 createMemo 来缓存计算结果
	const currentPathInfo = createMemo(() => {
		const currentPath = location.pathname
		let selectedIndex: string | null = null
		let openIndex: string | null = null

		props.menuItems.forEach((item, index) => {
			if (item.href === currentPath) {
				selectedIndex = index.toString()
			} else {
				item.children?.forEach((subItem, subIndex) => {
					if (subItem.href === currentPath) {
						selectedIndex = `${index}-${subIndex}`
						openIndex = index.toString()
					}
				})
			}
		})

		return { selectedIndex, openIndex }
	})

	// 根据当前路径设置选中的菜单项
	createEffect(() => {
		const { selectedIndex, openIndex } = currentPathInfo()
		if (selectedIndex !== null) {
			setSelectedItem(selectedIndex)
		}

		if (openIndex !== null) {
			setOpenItems((prev) => ({ ...prev, [openIndex]: true }))
		}
	})

	return (
		<SidebarContext.Provider
			value={{ openItems, selectedItem, toggleItem, selectItem }}
		>
			{props.children}
		</SidebarContext.Provider>
	)
}

export const useSidebarContext = () => {
	const context = useContext(SidebarContext)
	if (!context) {
		throw new Error(
			"useSidebarContext must be used within a SidebarProvider",
		)
	}
	return context
}

export const Sidebar = (props: SidebarProps) => {
	// 是否折叠的
	const [collapsed, setCollapsed] = createSignal(false)

	// 是否手动折叠的
	const [isManualCollapse, setIsManualCollapse] = createSignal(false)

	// 鼠标是否在侧边栏内部的
	const [isMouseInside, setIsMouseInside] = createSignal(false)

	const handleCollapseToggle = () => {
		// 如果当前是手动折叠状态
		if (isManualCollapse()) {
			// 取消手动折叠状态并展开侧边栏
			setIsManualCollapse(false)
			setCollapsed(false)
		} else {
			// 否则，设置为手动折叠状态并切换侧边栏的折叠状态
			setIsManualCollapse(true)
			setCollapsed(!collapsed())
		}
	}

	return (
		<SidebarProvider menuItems={props.menuItems}>
			<div
				class="relative h-full"
				onMouseEnter={() => {
					setIsMouseInside(true)
					setTimeout(() => {
						if (isManualCollapse() && isMouseInside()) {
							setCollapsed(false)
						}
					}, 100)
				}}
				onMouseLeave={() => {
					setIsMouseInside(false)
					if (isManualCollapse()) {
						setCollapsed(true)
					}
				}}
			>
				<div
					classList={{
						"w-0": collapsed(),
						"w-60": !collapsed(),
						"h-full": true,
						"bg-sidebar-background": true,
						"text-foreground": true,
						"transition-width": true,
						"duration-200": true,
						"overflow-y-auto": true,
					}}
				>
					<div class="flex flex-row items-center justify-between gap-8 h-14 py-8 px-4">
						{/* <img src="/logo.png" alt="logo" class="w-8 h-8" /> */}
						<Show when={!collapsed()}>
							<SiBoxysvg />
							<span class="text-white text-lg">XXXXXX</span>
						</Show>

						<button
							type="button"
							onClick={handleCollapseToggle}
							class={`transition-transform duration-300 ${
								collapsed() ? "rotate-180" : ""
							}`}
						>
							<Dynamic
								component={
									collapsed()
										? AiOutlineAlignRight
										: AiOutlineAlignLeft
								}
								class="text-white"
							/>
						</button>
					</div>
					<ul class="list-none mt-2 p-2.5">
						<For each={props.menuItems}>
							{(item, index) => (
								<MenuItem item={item} index={index} />
							)}
						</For>
					</ul>
				</div>

				{/* 一个透明的遮罩层，用于鼠标进入/离开时，自动展开侧边栏 */}
				<Show when={collapsed()}>
					<div class="absolute top-0 left-0 w-8 h-full bg-transparent z-0" />
				</Show>
			</div>
		</SidebarProvider>
	)
}
