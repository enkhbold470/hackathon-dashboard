import { ThemeCustomizer } from "@/components/theme-customizer";

export default function ThemePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Theme Customization</h1>
      <p className="mb-6">
        Customize the application theme using the controls below. All colors are driven by 5 core variables.
      </p>
      <ThemeCustomizer />
    </div>
  );
} 