import { z } from 'zod';

export const DocsEntrySchema = z.object({
	sourcePath: z.string(),
	title: z.string(),
	description: z.string(),
	category: z.string(),
	headings: z.array(z.string()),
	keywords: z.array(z.string()),
	snippet: z.string(),
});

const ComponentPropSchema = z.object({
	name: z.string(),
	type: z.string(),
	default: z.string().optional(),
	description: z.string(),
});

export const ComponentInfoSchema = z.object({
	name: z.string(),
	package: z.enum(['lism-css', '@lism-css/ui']),
	category: z.string(),
	description: z.string(),
	props: z.array(ComponentPropSchema),
	usage: z.string(),
});

const TokenEntrySchema = z.object({
	name: z.string(),
	value: z.string(),
	description: z.string().optional(),
});

export const TokenCategorySchema = z.object({
	category: z.string(),
	description: z.string(),
	tokens: z.array(TokenEntrySchema),
});

const PropEntrySchema = z.object({
	prop: z.string(),
	cssProperty: z.string(),
	type: z.string(),
	responsive: z.boolean(),
	description: z.string(),
	values: z.array(z.string()).optional(),
});

const PropCategorySchema = z.object({
	category: z.string(),
	description: z.string(),
	props: z.array(PropEntrySchema),
});

export const PropsSystemDataSchema = z.object({
	description: z.string(),
	categories: z.array(PropCategorySchema),
});

const PackageInfoSchema = z.object({
	name: z.string(),
	npmName: z.string(),
	description: z.string(),
	version: z.string(),
});

export const OverviewDataSchema = z.object({
	description: z.string(),
	architecture: z.string(),
	packages: z.array(PackageInfoSchema),
	breakpoints: z.record(z.string()),
	installation: z.string(),
	cssLayers: z.string(),
});
