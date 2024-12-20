import type { ParentProps } from "solid-js"
import { useLocale } from "~/i18n/lib"
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "../ui/sheet"
import { TextField, TextFieldLabel } from "../ui/text-field"
import LocaleSelect from "./locale-select"

const SettingsSheet = (props: ParentProps) => {
	const { t } = useLocale()

	return (
		<Sheet>
			<SheetTrigger>{props.children}</SheetTrigger>
			<SheetContent class="w-[400px] sm:w-[540px]" position="right">
				<SheetHeader>
					<SheetTitle>{t.setting.title()}</SheetTitle>
					<SheetDescription>
						{t.setting.description()}
					</SheetDescription>
				</SheetHeader>
				<div class="mt-6">
					<TextField>
						<TextFieldLabel>{t.setting.language()}</TextFieldLabel>
						<LocaleSelect class="mt-2" />
					</TextField>
				</div>
			</SheetContent>
		</Sheet>
	)
}

export default SettingsSheet
