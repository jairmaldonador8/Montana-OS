import React from 'react';
import { motion } from 'motion/react';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MontanaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const MontanaCardRoot = React.forwardRef<HTMLDivElement, MontanaCardProps>(
  ({ className, children, ...props }, ref) => (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Card
        ref={ref}
        className={cn(
          'bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300',
          className
        )}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  )
);
MontanaCardRoot.displayName = 'MontanaCard';

const MontanaCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardHeader
    ref={ref}
    className={cn('space-y-1.5', className)}
    {...props}
  />
));
MontanaCardHeader.displayName = 'MontanaCardHeader';

const MontanaCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <CardTitle
    ref={ref as any}
    className={cn('text-lg font-semibold text-gray-900', className)}
    {...props}
  />
));
MontanaCardTitle.displayName = 'MontanaCardTitle';

const MontanaCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <CardDescription
    ref={ref}
    className={cn('text-sm text-gray-600', className)}
    {...props}
  />
));
MontanaCardDescription.displayName = 'MontanaCardDescription';

const MontanaCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardContent
    ref={ref}
    className={cn('pt-0', className)}
    {...props}
  />
));
MontanaCardContent.displayName = 'MontanaCardContent';

const MontanaCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardFooter
    ref={ref}
    className={cn('flex items-center justify-end gap-2 pt-4', className)}
    {...props}
  />
));
MontanaCardFooter.displayName = 'MontanaCardFooter';

export const MontanaCard = Object.assign(MontanaCardRoot, {
  Header: MontanaCardHeader,
  Title: MontanaCardTitle,
  Description: MontanaCardDescription,
  Content: MontanaCardContent,
  Footer: MontanaCardFooter,
});
