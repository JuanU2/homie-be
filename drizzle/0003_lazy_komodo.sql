ALTER TABLE "room_equipment" RENAME TO "property_equipment";--> statement-breakpoint
ALTER TABLE "property_equipment" RENAME COLUMN "room_id" TO "property_id";--> statement-breakpoint
ALTER TABLE "property_equipment" DROP CONSTRAINT "room_equipment_room_id_rooms_id_fk";
--> statement-breakpoint
ALTER TABLE "property_equipment" DROP CONSTRAINT "room_equipment_equipment_type_id_equipment_types_id_fk";
--> statement-breakpoint
ALTER TABLE "property_equipment" ADD CONSTRAINT "property_equipment_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_equipment" ADD CONSTRAINT "property_equipment_equipment_type_id_equipment_types_id_fk" FOREIGN KEY ("equipment_type_id") REFERENCES "public"."equipment_types"("id") ON DELETE cascade ON UPDATE no action;