// setup.js
const fs = require('fs').promises;
const path = require('path');

async function createDirectories() {
    const dirs = [
        'src/components/ui',
        'src/lib'
    ];

    for (const dir of dirs) {
        try {
            await fs.mkdir(dir, { recursive: true });
            console.log(`✅ Created directory: ${dir}`);
        } catch (error) {
            console.log(`ℹ️ Directory exists: ${dir}`);
        }
    }
}

async function createUIComponents() {
    const components = {
        'src/components/ui/input.tsx': `
import * as React from "react"

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={className}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }`,

        'src/components/ui/button.tsx': `
import * as React from "react"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg'
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <button
                className={className}
                ref={ref}
                {...props}
            >
                {children}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }`,

        'src/components/ui/card.tsx': `
import * as React from "react"

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={className} {...props} />
    )
)
Card.displayName = "Card"

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={className} {...props} />
    )
)
CardHeader.displayName = "CardHeader"

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={className} {...props} />
    )
)
CardContent.displayName = "CardContent"`,

        'src/components/ui/index.ts': `
export * from './input'
export * from './button'
export * from './card'`
    };

    for (const [file, content] of Object.entries(components)) {
        try {
            await fs.writeFile(file, content);
            console.log(`✅ Created file: ${file}`);
        } catch (error) {
            console.error(`❌ Error creating ${file}:`, error);
        }
    }
}

async function updatePackageJson() {
    try {
        const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));

        // Add required dependencies if they don't exist
        packageJson.dependencies = {
            ...packageJson.dependencies,
            "class-variance-authority": "^0.7.0",
            "clsx": "^2.0.0",
            "tailwind-merge": "^2.0.0"
        };

        await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
        console.log('✅ Updated package.json');
    } catch (error) {
        console.error('❌ Error updating package.json:', error);
    }
}

async function setup() {
    try {
        await createDirectories();
        await createUIComponents();
        await updatePackageJson();

        console.log('\n🎉 Setup completed! Now run:');
        console.log('npm install');
        console.log('npm run dev');
    } catch (error) {
        console.error('❌ Setup failed:', error);
    }
}

setup();