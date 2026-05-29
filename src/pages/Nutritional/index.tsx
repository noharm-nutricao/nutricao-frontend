import withLayout from "src/lib/withLayout";
import { NutritionalDashboard } from "features/nutritional/NutritionalDashboard";

const NutritionalWithLayout = withLayout(NutritionalDashboard, {});

export default NutritionalWithLayout;
