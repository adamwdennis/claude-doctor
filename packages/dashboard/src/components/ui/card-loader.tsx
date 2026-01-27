import { Card, CardContent } from "@/components/ui/card";
import { AnimatedLoader } from "./animated-loader";

export function CardLoader() {
	return (
		<Card>
			<CardContent className="flex items-center justify-center py-12">
				<AnimatedLoader />
			</CardContent>
		</Card>
	);
}
