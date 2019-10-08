echo "this is the var $E_VUE_BUILD_MODE"
if [ "$E_VUE_BUILD_MODE" = "development" ]
then npm run build-test
else npm run build
fi
