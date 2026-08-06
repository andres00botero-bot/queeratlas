-- Queer Atlas venue intelligence: global review-led editorial pass, batch 42.
-- Final three Bogota records: one current gay cafe, one closed former bar, and one duplicate record.
-- Checked 2026-08-06. Source names remain in evidence metadata, not reader-facing topic copy.

begin;

with reviewed(id, patch) as (
  values
    (588::bigint, jsonb_build_object(
      'queue_wait', 'This two-floor café-bar is normally a walk-in, with no famous door line. Come off-peak for the most attentive service or reserve a table for a group. Friday and Saturday run later and gather more drinkers, but the room stays closer to conversation than megaclub crush. The current location is Carrera 8 #64-29.',
      'best_nights', 'Friday or Saturday turns the pink, stained-glass rooms into a gentle launch for a queer night, with cocktails and requested music videos until around 2am. A weekday is better for food, coffee and meeting locals. The venue’s 1997 roots matter, but current reviews disagree on whether its old warmth is fully intact.',
      'crowd_mix', 'Gay Bogotanos and long-time regulars form the history, joined by queer visitors, straight friends and foreigners looking for a small local bar. A current guest specifically praises meeting people from abroad; another misses the former intimacy. Expect a mixed-age social room, not a tourist-only or men-only scene.',
      'dress_code', 'No fashion door: date-night casual, jeans, colour or a relaxed pre-club look all work. Pink lighting and velvet welcome personality without demanding polish. Dress for sitting, chatting and perhaps moving on. A current listing says it is not wheelchair accessible, so confirm the stair and entrance route.',
      'staff_inclusivity', 'Recent guests praise patient, respectful bartenders, strong cocktails, fair prices and help for people who do not speak Spanish. Others say the café has lost warmth and food consistency. The welcome signal is mostly positive, but the two-floor layout lacks verified step-free access and service is better outside peaks.',
      'venue_classification', 'active_historic_1997_chapinero_gay_cafe_cocktail_bar_with_two_floors_local_regular_and_visitor_mix_current_service_drink_praise_and_material_identity_food_access_variation',
      'identity_note', 'Current review and social evidence places Village Café at Carrera 8 #64-29. The stored record lacks an address and its coordinates require verification before directions are shown.',
      'source_urls', to_jsonb(array['https://www.instagram.com/villagebogota/','https://wanderlog.com/place/details/978675/village-caf%C3%A9','https://es.restaurantguru.com/Village-Cafe-Bogota','https://www.tripadvisor.es/Attraction_Review-g294074-d5996916-Reviews-Village_Cafe_Bogota-Bogota.html','https://www.thegayagenda.fyi/bogota/businesses/village-cafe/','https://planbogota.bogotadc.travel/drpl/sites/default/files/2022-12/Gu%C3%ADa%20LGBTI%20Digital%20ok.pdf']::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','two_floor_walkin_offpeak_service_group_reservation_weekend_build_and_current_address_context','source_urls',to_jsonb(array['https://wanderlog.com/place/details/978675/village-caf%C3%A9','https://es.restaurantguru.com/Village-Cafe-Bogota']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'best_nights', jsonb_build_object('status','friday_saturday_late_cocktail_music_video_warmup_weekday_food_coffee_and_current_identity_variation','source_urls',to_jsonb(array['https://wanderlog.com/place/details/978675/village-caf%C3%A9','https://es.restaurantguru.com/Village-Cafe-Bogota','https://planbogota.bogotadc.travel/drpl/sites/default/files/2022-12/Gu%C3%ADa%20LGBTI%20Digital%20ok.pdf']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','gay_bogotano_regular_queer_visitor_straight_friend_foreigner_and_mixed_age_social_mix','source_urls',to_jsonb(array['https://es.restaurantguru.com/Village-Cafe-Bogota','https://www.tripadvisor.es/Attraction_Review-g294074-d5996916-Reviews-Village_Cafe_Bogota-Bogota.html','https://www.thegayagenda.fyi/bogota/businesses/village-cafe/']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'dress_code', jsonb_build_object('status','informal_date_preclub_pink_velvet_two_floor_and_no_wheelchair_access_listing_context_without_door_code','source_urls',to_jsonb(array['https://wanderlog.com/place/details/978675/village-caf%C3%A9','https://es.restaurantguru.com/Village-Cafe-Bogota']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','patient_respectful_language_help_cocktail_price_praise_balanced_against_lost_warmth_food_peak_service_and_access_variation','source_urls',to_jsonb(array['https://wanderlog.com/place/details/978675/village-caf%C3%A9','https://es.restaurantguru.com/Village-Cafe-Bogota','https://www.thegayagenda.fyi/bogota/businesses/village-cafe/']::text[]),'checked_at','2026-08-06T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus','updated_at', '2026-08-06T00:00:00Z'
    )),
    (590::bigint, jsonb_build_object(
      'queue_wait', 'Do not queue here: the former Vintrash at Avenida Calle 85 #11-53 is reported permanently closed. Its final phase was nearly empty even on Saturday, and old hours are obsolete. A successor now sells tickets at the address, but it is a different venue and must not inherit this record’s history.',
      'best_nights', 'There is no current best night for Vintrash Bogotá. Historically, Tuesday language exchange led into a party, while weekend rooms mixed dancing, pool and cocktails. The final reviews describe six people on a Saturday and toilets without running water. For the address today, research the successor venue as a new entity.',
      'crowd_mix', 'The former bar mixed language learners, local groups, international visitors and mainstream Zona T partygoers; evidence does not make it a dedicated queer venue. That crowd is archival. Anyone at the building today attends the successor brand, not Vintrash, and must be reviewed separately.',
      'dress_code', 'No current code applies because the venue is closed. Its former playful, multi-room party accepted casual Zona T looks, but those memories must not guide entry to the successor. Read the new operator’s ticket terms, carry ID and never assume an old listing’s dress or admission policy survives a change of brand.',
      'staff_inclusivity', 'Archived reviews praised professional, friendly teams on lively language-exchange nights, while later guests reported cold security, an empty room and toilets without water. Closure ends any defensible current staff score. The replacement at this address needs its own inclusion, access and safety evidence from zero.',
      'venue_classification', 'permanently_closed_former_zona_t_language_exchange_food_games_and_multiroom_party_bar_with_declining_attendance_facility_and_security_reports_and_separate_successor_at_same_address',
      'record_status', 'permanently_closed_do_not_publish_or_route_successor_haus_bar_at_same_address_requires_separate_record_and_research',
      'identity_note', 'Vintrash Bogotá at Avenida Calle 85 #11-53 is reported permanently closed. Current ticketing at that address identifies Haus Bar, hosted by Grupo Vintrash; it is a successor concept, not proof that this venue remains active.',
      'source_urls', to_jsonb(array['https://es.restaurantguru.com/Vintrash-Bar-Bogota','https://restaurantguru.com/Vintrash-Bar-Bogota','https://www.tripadvisor.com.br/Attraction_Review-g294074-d14803837-Reviews-Vintrash_Bar-Bogota.html','https://www.songkick.com/venues/3910839-vintrash','https://tikipal.com.co/bogota/hausbar']::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','permanent_closure_obsolete_hours_final_low_attendance_and_distinct_successor_at_same_address','source_urls',to_jsonb(array['https://es.restaurantguru.com/Vintrash-Bar-Bogota','https://restaurantguru.com/Vintrash-Bar-Bogota','https://tikipal.com.co/bogota/hausbar']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'best_nights', jsonb_build_object('status','no_current_night_with_archived_tuesday_language_exchange_weekend_rooms_final_low_attendance_and_broken_water_context','source_urls',to_jsonb(array['https://restaurantguru.com/Vintrash-Bar-Bogota','https://www.tripadvisor.com.br/Attraction_Review-g294074-d14803837-Reviews-Vintrash_Bar-Bogota.html']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','archived_language_learner_local_group_international_mainstream_zona_t_mix_without_lgbtq_specific_identity_and_no_current_crowd','source_urls',to_jsonb(array['https://restaurantguru.com/Vintrash-Bar-Bogota','https://www.tripadvisor.com.br/Attraction_Review-g294074-d14803837-Reviews-Vintrash_Bar-Bogota.html']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'dress_code', jsonb_build_object('status','no_current_code_due_closure_with_successor_specific_ticket_id_and_admission_rules_required','source_urls',to_jsonb(array['https://es.restaurantguru.com/Vintrash-Bar-Bogota','https://tikipal.com.co/bogota/hausbar']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','archived_friendly_service_praise_balanced_against_late_security_empty_room_broken_water_and_no_current_staff_score','source_urls',to_jsonb(array['https://restaurantguru.com/Vintrash-Bar-Bogota','https://www.tripadvisor.com.br/Attraction_Review-g294074-d14803837-Reviews-Vintrash_Bar-Bogota.html']::text[]),'checked_at','2026-08-06T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus','updated_at', '2026-08-06T00:00:00Z'
    )),
    (1201::bigint, jsonb_build_object(
      'queue_wait', 'This record duplicates the same La Estación Café already stored as place 1682. At the real venue, reserve a table rather than planning for a club queue; Friday and Saturday are busiest. This duplicate must stay out of search, maps and city counts so guests do not see two fake choices for one front door.',
      'best_nights', 'The physical café is best Friday or Saturday for food, cocktails and a pre-club start, or on a quieter weekday for a date. Those details belong to canonical place 1682. This row has no separate programme, room or night of its own and should never generate another recommendation card.',
      'crowd_mix', 'There is no second crowd here. Gay Bogotanos, couples, birthday groups, regulars and queer visitors gather at the one historic Chapinero café represented by canonical place 1682. Keeping this row visible would falsely double its local weight and distort every city-level venue count.',
      'dress_code', 'The real café welcomes romantic casual clothes without a selection-based door; canonical place 1682 holds the full guidance. This database duplicate has no independent dress code. Hide or merge it instead of creating lightly reworded advice that suggests another venue exists nearby.',
      'staff_inclusivity', 'No separate team serves this record. The real venue’s staff, access notes and review consensus live on canonical place 1682. Moderation should merge contributions and reviews there, preserve useful history, then redirect or suppress this duplicate so community ratings are not split.',
      'venue_classification', 'duplicate_database_record_of_active_historic_chapinero_gay_cafe_place_1682_with_no_independent_physical_venue_programme_crowd_staff_or_review_identity',
      'record_status', 'duplicate_merge_required_hide_from_search_maps_sitemap_city_counts_and_recommendations_canonical_place_id_1682',
      'identity_note', 'Duplicate of place ID 1682, La Estación Café Chapinero at Calle 62 #7-13/19. Preserve and merge any user contributions into 1682 before deleting or redirecting this row.',
      'canonical_place_id', 1682,
      'source_urls', to_jsonb(array['https://www.estacioncafecolombia.com/chapinero.html','https://www.tripadvisor.com.mx/Attraction_Review-g294074-d15585117-Reviews-La_Estacion_Cafe-Bogota.html','https://restaurantguru.com/La-Estacion-Bogota-4']::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','confirmed_same_name_same_address_same_operation_duplicate_of_canonical_1682_with_real_venue_reservation_context','source_urls',to_jsonb(array['https://www.estacioncafecolombia.com/chapinero.html','https://restaurantguru.com/La-Estacion-Bogota-4']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'best_nights', jsonb_build_object('status','no_independent_programme_and_real_weekend_weekday_guidance_owned_by_canonical_1682','source_urls',to_jsonb(array['https://www.estacioncafecolombia.com/chapinero.html','https://www.tripadvisor.com.mx/Attraction_Review-g294074-d15585117-Reviews-La_Estacion_Cafe-Bogota.html']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','no_second_crowd_and_all_real_guest_evidence_owned_by_same_physical_canonical_1682_venue','source_urls',to_jsonb(array['https://www.tripadvisor.com.mx/Attraction_Review-g294074-d15585117-Reviews-La_Estacion_Cafe-Bogota.html','https://restaurantguru.com/La-Estacion-Bogota-4']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'dress_code', jsonb_build_object('status','no_independent_door_or_code_and_real_cafe_guidance_owned_by_canonical_1682','source_urls',to_jsonb(array['https://www.estacioncafecolombia.com/chapinero.html']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','no_independent_team_and_all_service_access_review_and_community_rating_evidence_must_merge_to_canonical_1682','source_urls',to_jsonb(array['https://restaurantguru.com/La-Estacion-Bogota-4','https://www.tripadvisor.com.mx/Attraction_Review-g294074-d15585117-Reviews-La_Estacion_Cafe-Bogota.html']::text[]),'checked_at','2026-08-06T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus','updated_at', '2026-08-06T00:00:00Z'
    ))
)
update public.places as p
set venue_intel = coalesce(p.venue_intel, '{}'::jsonb) || reviewed.patch
from reviewed
where p.id = reviewed.id;

update public.places
set seo_indexable = false,
    seo_quality_status = 'rejected'
where id in (590,1201);

do $$
declare updated_count integer;
begin
  select count(*) into updated_count from public.places
  where id in (588,590,1201)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-06T00:00:00Z';
  if updated_count <> 3 then raise exception 'Expected 3 globally reviewed venue rows, found %', updated_count; end if;
  if exists (select 1 from public.places where id in (590,1201) and coalesce(seo_indexable,true)) then
    raise exception 'Closed and duplicate records must be non-indexable';
  end if;
end $$;

commit;
