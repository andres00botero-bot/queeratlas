import AddServiceInlineForm from "@/components/city/AddServiceInlineForm";
import AddEventInlineForm from "@/components/city/AddEventInlineForm";
import AddPlaceInlineForm from "@/components/city/AddPlaceInlineForm";
import CityContributionActions from "@/components/city/CityContributionActions";

export default function CityContributionStack({
  addMode,
  addEventMode,
  addServiceMode,
  onToggleAddPlace,
  onToggleAddEvent,
  onToggleAddService,
  placeFormProps,
  eventFormProps,
  serviceFormProps,
  showActions = true,
}) {
  return (
    <>
      {showActions ? (
        <CityContributionActions
          addMode={addMode}
          addEventMode={addEventMode}
          addServiceMode={addServiceMode}
          onToggleAddPlace={onToggleAddPlace}
          onToggleAddEvent={onToggleAddEvent}
          onToggleAddService={onToggleAddService}
        />
      ) : null}

      {addMode && <AddPlaceInlineForm {...placeFormProps} />}

      {addEventMode && <AddEventInlineForm {...eventFormProps} />}

      {addServiceMode && <AddServiceInlineForm {...serviceFormProps} />}
    </>
  );
}
