import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type SectionProps, type SandboxSettings, type SandboxNetworkSettings } from "../types";

interface StringArrayInputProps {
	label: string;
	values: string[];
	onChange: (values: string[]) => void;
	placeholder?: string;
}

function StringArrayInput({
	label,
	values,
	onChange,
	placeholder,
}: StringArrayInputProps) {
	const [newValue, setNewValue] = useState("");

	function handleAdd() {
		if (newValue && !values.includes(newValue)) {
			onChange([...values, newValue]);
			setNewValue("");
		}
	}

	function handleRemove(value: string) {
		onChange(values.filter((v) => v !== value));
	}

	return (
		<div className="space-y-2">
			<label className="text-sm font-medium">{label}</label>
			<div className="flex flex-wrap gap-2">
				<AnimatePresence mode="popLayout">
					{values.map((value) => (
						<motion.div
							key={value}
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
						>
							<Badge variant="secondary" className="gap-1 pr-1">
								{value}
								<button
									className="ml-1 rounded-full p-0.5 hover:bg-white/20"
									onClick={() => handleRemove(value)}
								>
									<X className="h-3 w-3" />
								</button>
							</Badge>
						</motion.div>
					))}
				</AnimatePresence>
			</div>
			<div className="flex items-center gap-2">
				<Input
					className="flex-1"
					placeholder={placeholder}
					value={newValue}
					onChange={(e) => setNewValue(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleAdd()}
				/>
				<Button variant="outline" size="sm" onClick={handleAdd} disabled={!newValue}>
					<Plus className="mr-2 h-4 w-4" />
					Add
				</Button>
			</div>
		</div>
	);
}

export function SandboxSection({ data, onChange }: SectionProps) {
	const sandbox = (data.sandbox as SandboxSettings) ?? {};
	const network = sandbox.network ?? {};

	function updateSandbox(updates: Partial<SandboxSettings>) {
		onChange({
			...data,
			sandbox: { ...sandbox, ...updates },
		});
	}

	function updateNetwork(updates: Partial<SandboxNetworkSettings>) {
		updateSandbox({
			network: { ...network, ...updates },
		});
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<label className="text-sm font-medium">Enabled</label>
					<p className="text-xs text-muted-foreground">Enable sandbox mode</p>
				</div>
				<Switch
					checked={sandbox.enabled ?? false}
					onCheckedChange={(checked) => updateSandbox({ enabled: checked })}
				/>
			</div>

			<div className="flex items-center justify-between">
				<div>
					<label className="text-sm font-medium">Auto-Allow Bash in Sandbox</label>
					<p className="text-xs text-muted-foreground">
						Auto-approve bash if sandboxed
					</p>
				</div>
				<Switch
					checked={sandbox.autoAllowBashIfSandboxed ?? false}
					onCheckedChange={(checked) =>
						updateSandbox({ autoAllowBashIfSandboxed: checked })
					}
				/>
			</div>

			<div className="flex items-center justify-between">
				<div>
					<label className="text-sm font-medium">Allow Unsandboxed Commands</label>
					<p className="text-xs text-muted-foreground">
						Allow some commands to run outside sandbox
					</p>
				</div>
				<Switch
					checked={sandbox.allowUnsandboxedCommands ?? false}
					onCheckedChange={(checked) =>
						updateSandbox({ allowUnsandboxedCommands: checked })
					}
				/>
			</div>

			<div className="flex items-center justify-between">
				<div>
					<label className="text-sm font-medium">Enable Weaker Nested Sandbox</label>
					<p className="text-xs text-muted-foreground">
						Less restrictive nested sandbox
					</p>
				</div>
				<Switch
					checked={sandbox.enableWeakerNestedSandbox ?? false}
					onCheckedChange={(checked) =>
						updateSandbox({ enableWeakerNestedSandbox: checked })
					}
				/>
			</div>

			<StringArrayInput
				label="Excluded Commands"
				values={sandbox.excludedCommands ?? []}
				onChange={(values) =>
					updateSandbox({ excludedCommands: values.length ? values : undefined })
				}
				placeholder="e.g. docker"
			/>

			<div className="space-y-4 rounded-md border p-4">
				<h4 className="text-sm font-medium">Network Settings</h4>

				<div className="flex items-center justify-between">
					<label className="text-sm">Allow Local Binding</label>
					<Switch
						checked={network.allowLocalBinding ?? false}
						onCheckedChange={(checked) =>
							updateNetwork({ allowLocalBinding: checked })
						}
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<label className="text-sm">HTTP Proxy Port</label>
						<Input
							type="number"
							value={network.httpProxyPort ?? ""}
							onChange={(e) =>
								updateNetwork({
									httpProxyPort: e.target.value
										? parseInt(e.target.value, 10)
										: undefined,
								})
							}
							placeholder="e.g. 8080"
						/>
					</div>
					<div className="space-y-2">
						<label className="text-sm">SOCKS Proxy Port</label>
						<Input
							type="number"
							value={network.socksProxyPort ?? ""}
							onChange={(e) =>
								updateNetwork({
									socksProxyPort: e.target.value
										? parseInt(e.target.value, 10)
										: undefined,
								})
							}
							placeholder="e.g. 1080"
						/>
					</div>
				</div>

				<StringArrayInput
					label="Allow Unix Sockets"
					values={network.allowUnixSockets ?? []}
					onChange={(values) =>
						updateNetwork({ allowUnixSockets: values.length ? values : undefined })
					}
					placeholder="e.g. /var/run/docker.sock"
				/>
			</div>
		</div>
	);
}
