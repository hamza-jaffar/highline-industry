import Heading from "@/components/ui/heading"

const SettingPage = () => {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <Heading
                    title="Settings"
                    description="Manage your settings."
                />
            </div>
        </div>
    )
}

export default SettingPage